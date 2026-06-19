# Architecture

## Overview

`hapic` is built in two layers:

1. **Base client (`hapic`)** — a single `Client` class wrapping `fetch`. It owns the entire request lifecycle: merging defaults, applying headers, running request hooks and transformers, dispatching via `fetch`, detecting the response type, throwing on 4xx/5xx, and running response/error hooks.
2. **Service clients (`@hapic/*`)** — each declares a `<Service>Client extends Client` that, in its constructor, instantiates a set of **domain `*API`** objects. Each `*API` extends an abstract `BaseAPI` that holds a reference back to the client and issues requests through it. Domain methods translate a typed call (e.g. `client.project.getOne(id)`) into a base-client request and shape the response.

This keeps transport concerns in one place and lets each service package focus purely on endpoint shapes and payload types.

## Request Lifecycle (base `Client.request`)

`packages/client/src/module.ts` is the heart of the system. A `request(config)` call:

```
1. Build headers   → merge per-request headers over the client's default headers
2. Resolve URL     → withBase(url, baseURL); then withQuery(...) for params/query (bigint → string via traverse)
3. Request hooks   → hookManager.triggerReqHook(options)            (HookName.REQUEST)
4. Transformers    → apply options.transform fn(s) to the body
5. Dispatch        → fetch(url, init), with/without proxy (createProxy from node-fetch-native)
6. Decode          → pick by responseType OR detectResponseType(Content-Type):
                       stream | blob | arrayBuffer | text | json (JSON.parse, falling back to text)
                     → response.data is exposed via a lazy getter/setter
7. Error check     → status 400–599 → createClientError(...) → error hooks (REQUEST_ERROR / RESPONSE_ERROR)
8. Response hooks  → hookManager.triggerResHook(response)           (HookName.RESPONSE)
```

`get` / `delete` / `head` / `post` / `put` / `patch` are thin wrappers that set `method` (+ `body` for write methods) and delegate to `request`. Bodies are stripped for methods that don't support a payload (`isRequestPayloadSupported`).

### Error hooks can recover

When a request or response error occurs, the matching error hook may return either a `Response` (used as the result) or a new `RequestOptions` (the request is **retried** by recursively calling `request`). If no hook handles it, the `ClientError` is thrown. This is how retry/refresh-token style behavior is implemented.

## Design Patterns

### Client class (base)

`Client` implements `IClient` (`packages/client/src/type.ts`) — the interface that captures its full public request surface. Everywhere a client is referenced as a *type* (domain `BaseAPI`, the `createClientRegistry` generic constraint, helper signatures), code depends on `IClient` rather than the concrete class; only construction (`new Client`), `extends Client`, and the marker check work with the class itself.

```typescript
export class Client implements IClient {
    public defaults: RequestBaseOptions;
    protected headers: Headers;
    protected hookManager: HookManager;

    constructor(input: RequestBaseOptions = {}) {
        /* extend defaults, init headers + hooks; then: */
        markInstanceof(this, Symbol.for('hapic/Client'));   // register the cross-realm marker
    }

    request<T, RT, R>(config: RequestOptions<RT>): Promise<R> { /* lifecycle above */ }
    get/post/put/patch/delete/head(...): Promise<R> { /* delegate to request */ }

    setBaseURL / getBaseURL(...)
    setHeader / getHeader / unsetHeader / unsetHeaders(...)
    setAuthorizationHeader / getAuthorizationHeader / unsetAuthorizationHeader(...)

    on(name, fn): number    // register a hook, returns an id
    off(name, fn?): this    // remove a specific hook or all hooks for a name
}
```

### Service client (extension)

A service client extends `Client`, composes domain APIs, and applies connection config:

```typescript
export class HarborClient extends BaseClient {           // BaseClient = Client from 'hapic'
    public readonly project: ProjectAPI;
    public readonly robot: RobotAPI;
    // ...

    constructor(input?: ConfigInput) {
        super(input?.request);
        this.project = new ProjectAPI({ client: this });   // pass `this` so APIs reuse one transport
        this.robot   = new RobotAPI({ client: this });
        this.applyConfig(input);                            // connectionString → baseURL + auth header
    }
}
```

`@hapic/oauth2`'s `OAuth2Client` registers its own marker (`markInstanceof(this, Symbol.for('@hapic/oauth2/OAuth2Client'))`) in addition to the inherited `Client` marker, and passes an extra `options` object into each domain API context. Markers are namespaced (`hapic/…`, `@hapic/<pkg>/…`) to avoid cross-library `Symbol.for` collisions.

### Domain API + BaseAPI

```typescript
// domains/base.ts — shared base for all domain APIs
export abstract class BaseAPI {
    protected client!: IClient;   // the client contract, not the concrete `Client` class
    protected constructor(context?: BaseAPIContext) { this.setClient(context?.client); }
    setClient(input?: IClient | RequestBaseOptions) {
        this.client = isClient(input) ? input : createClient(input);  // accepts a client OR raw options
    }
}

// domains/project/module.ts — a concrete domain
export class ProjectAPI extends BaseAPI {
    async getOne(id: string | number): Promise<Project> {
        const { data } = await this.client.get(`projects/${id}`);
        return data;
    }
    // create / update / delete / getMany / getAll ...
}
```

**Conventions:** domain classes are named `<Domain>API` and live in `domains/<domain>/module.ts`. They never call `fetch` directly — always go through `this.client`. They take a `BaseAPIContext` (`{ client?: IClient | RequestBaseOptions }`), so a domain API can be used standalone (it will create its own client) or share the parent client.

### Singleton instance registry

Both the base package and every service package expose an identical instance-management API backed by a keyed map (default key `'default'`):

```typescript
createClient(input?)      // construct a new client
useClient(key?)           // get-or-create the singleton for `key`
setClient(client, key?)   // register a client under `key`
hasClient(key?) / unsetClient(key?)
isClient(input)           // cross-realm marker check via hasInstanceof
```

These six functions are **not** hand-written per package. A single factory, `createClientRegistry({ create, id })` (`packages/client/src/registry.ts`, exported from `hapic`), owns the keyed map and returns them; each package supplies only how to construct its client and the marker symbol that identifies it:

```typescript
// e.g. packages/harbor/src/instance.ts
export const {
    hasClient, setClient, useClient, unsetClient, createClient, isClient,
} = createClientRegistry<HarborClient, ConfigInput>({
    create: (input) => new HarborClient(input),
    id: HARBOR_CLIENT_INSTANCE,
});
```

The factory keeps `setClient`/`useClient` generic over the client type, so the base package's `setClient<T>` / `useClient<T>` behavior is unchanged. `isClient` resolves purely through `hasInstanceof(input, id)` — every client stamps that marker in its constructor (see below), so the marker check covers same- and cross-realm instances. When adding a new client package, call `createClientRegistry` rather than re-implementing the registry; a per-package test should assert `isClient(createClient())` to catch a wrong `id`.

### Cross-realm `instanceof` (`@instanceof` marker chain)

Because consumers may have duplicate copies of a package, `instanceof` alone is unreliable. hapic uses [`@ebec/core`](https://www.npmjs.com/package/@ebec/core)'s marker mechanism: each class calls `markInstanceof(this, Symbol.for(...))` in its constructor, which **appends** its marker to a non-enumerable `@instanceof` `symbol[]` on the instance. Because constructors run base→derived, an instance accumulates a marker for every class in its lineage — so one instance satisfies **multiple** `instanceof` references at once (an `HttpResponseError` is matched by both `isHttpResponseError` and `isClientError`). Guards test the chain with `hasInstanceof(input, Symbol.for(name))` (re-exported from `packages/client/src/utils/instance.ts`; the legacy `verifyInstanceBySymbol(input, name)` wrapper resolves `name` to its symbol and delegates to it).

When adding a new client/error class, register its marker with `markInstanceof` in the constructor and add a matching `is*` guard built on `hasInstanceof`.

## Configuration

Service clients accept a `ConfigInput` (partial `Config`). The base request options are passed straight to the `Client` constructor; connection details are resolved in `applyConfig()`:

```typescript
type Config = {
    request: RequestBaseOptions,        // baseURL, headers, proxy, transformers, ...
    connectionString?: string,          // e.g. "user:password@https://host/api/"
    connectionOptions?: ConnectionOptions,  // { host, user, password }
};
```

`connectionString` is parsed (`parseConnectionString`) into `{ host, user, password }`, then mapped to `setBaseURL` + `setAuthorizationHeader({ type: 'Basic', ... })`.

## Error Handling

- Every error a hapic package throws descends from a common `HapicError` root (itself extending [`@ebec/core`](https://www.npmjs.com/package/@ebec/core)'s `BaseError`), so `isHapicError` matches anything thrown by `hapic` or a `@hapic/*` package (incl. `AuthorizationHeaderError` and the service `ConnectionStringParseError`). Within the request lifecycle, `ClientError` is the umbrella (request, optional response, `ErrorCode`); `createClientError` instantiates one of its subclasses — `HttpResponseError` (a 4xx/5xx response is present) or `NetworkError` (no response: dispatch/abort/connection failure). `BaseError` always assigns a string `code`, derived from the class name when none is given.
- The base client throws for any response with status `400–599` (`HttpResponseError`), and for network/dispatch failures (`NetworkError`, via `toError(e)`), unless an error hook returns a `Response` or a retry `RequestOptions`.
- Consumer-facing guards live in `error/helpers/check.ts`: `isHapicError` (any hapic error), `isClientError`, `isNetworkError`, `isHttpResponseError`, `isClientErrorWithStatusCode(error, code | code[])`, `isClientErrorDueNetworkIssue`. They use the `@instanceof` marker chain (so an ancestor guard matches a subclass instance) — prefer them over manual `instanceof`.

## Cross-environment fetch

`packages/client/src/fetch.ts` resolves `fetch`, `Headers`, `Blob`, `FormData`, and `AbortController` from `globalThis` when available, falling back to `node-fetch-native`. Proxy support comes from `node-fetch-native/proxy` (`createProxy`). This is what lets the same code run in Node.js, browsers, and workers.
