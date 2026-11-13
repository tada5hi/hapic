# Architecture

## Overview

`hapic` is built in two layers:

1. **Base client (`hapic`)** — a single `Client` class wrapping `fetch`. It owns the entire request lifecycle: merging defaults, applying headers, running request hooks and transformers, dispatching via `fetch`, detecting the response type, throwing on 4xx/5xx, and running response/error hooks.
2. **Service clients (`@hapic/*`)** — each declares a `<Service>Client extends Client` that, in its constructor, instantiates a set of **domain `*API`** objects. Each `*API` extends an abstract `BaseAPI` that holds a reference back to the client and issues requests through it. Domain methods translate a typed call (e.g. `client.project.getOne(id)`) into a base-client request and shape the response.

This keeps transport concerns in one place and lets each service package focus purely on endpoint shapes and payload types.

## Request Lifecycle (base `Client.request`)

`packages/client/src/module.ts` is the heart of the system. A `request(config)` call:

```
1. Resolve options → request/resolve: per-request options replace defaults; headers layered over the client's
2. Resolve URL     → withBase(url, baseURL); then withQuery(...) for params/query (bigint → string via traverse)
3. Request hooks   → hookManager.triggerReqHook(options)            (HookName.REQUEST)
4. Transformers    → apply options.transform fn(s) to the body
5. Dispatch        → fetch(url, init), with/without proxy (createProxy from node-fetch-native)
                     → `timeout` is pipeline-only: a fresh AbortSignal.timeout per dispatch, combined with the caller signal (AbortSignal.any); never in the transport's init
6. Decode          → pick by responseType OR detectResponseType(Content-Type):
                       stream | blob | arrayBuffer | text | json (JSON.parse, falling back to text)
                     → responseTransform fn(s) (not for streams; 4xx/5xx bodies too) → lazy response.data getter/setter
7. Error check     → status 400–599 → createClientError(...) → error hooks (REQUEST_ERROR / RESPONSE_ERROR)
8. Response hooks  → hookManager.triggerResHook(response)           (HookName.RESPONSE)
```

`get` / `delete` / `head` / `post` / `put` / `patch` are thin wrappers that set `method` (+ `body` for write methods) and delegate to `request`. Bodies are stripped for methods that don't support a payload (`isRequestPayloadSupported`).

### Error hooks can recover

When a request or response error occurs, the matching error hook may return either a `Response` (used as the result) or a new `RequestOptions` (the request is **retried** by recursively calling `request`). If no hook handles it, the `ClientError` is thrown. This is how retry/refresh-token style behavior is implemented.

## Design Patterns

### Client class (base)

`Client` implements `IClient` (`packages/client/src/types.ts`) — the interface that captures its full public request surface. Everywhere a client is referenced as a *type* (domain `BaseAPI`, the `createClientRegistry` generic constraint, helper signatures), code depends on `IClient` rather than the concrete class; only construction (`new Client`), `extends Client`, and the marker check work with the class itself.

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

    toOptions(): ClientOptions   // defaults + current headers (copies) + transport (same instance); no hooks

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

`@hapic/oauth2`'s `OAuth2Client` registers its own marker (`markInstanceof(this, Symbol.for('@hapic/oauth2/OAuth2Client'))`) in addition to the inherited `Client` marker. Markers are namespaced (`hapic/…`, `@hapic/<pkg>/…`) to avoid cross-library `Symbol.for` collisions.

### Domain API + BaseAPI

All domain objects build on one generic base exported by `hapic` (`packages/client/src/domain/`):

```typescript
// packages/client/src/domain/ — shared base for all domain APIs
export type BaseAPIContext<OPTIONS extends Record<string, any> = Record<string, any>> = {
    client?: IClient | RequestBaseOptions,   // a client to share, OR raw options to create one from
    options?: OPTIONS,                       // held by reference
};

export abstract class BaseAPI<OPTIONS extends Record<string, any> = Record<string, any>> {
    protected client: IClient;               // the client contract, not the concrete `Client` class
    protected options: OPTIONS;
    constructor(context: BaseAPIContext<OPTIONS> = {});
    setClient(input?: IClient | RequestBaseOptions): void;   // isClient(input) ? input : createClient(input)
    setOptions(options?: OPTIONS): void;                     // replaces the reference ({} when omitted)
    setOption<K extends keyof OPTIONS>(key: K, value: OPTIONS[K]): void;   // mutates the held object
    protected withBaseURL(baseURL?: string): { baseURL?: string };       // { baseURL } when non-empty, else {}
}

// packages/<service>/src/domains/base.ts — a thin per-package subclass
export abstract class BaseAPI extends SharedBaseAPI<Options> {}      // loki, oauth2, victorialogs
export abstract class BaseAPI extends SharedBaseAPI {}               // harbor (vault adds a deprecated `setDriver` alias)

// domains/project/module.ts — a concrete domain
export class ProjectAPI extends BaseAPI {
    async getOne(id: string | number): Promise<Project> {
        const { data } = await this.client.get(`projects/${id}`);
        return data;
    }
}
```

**Conventions:** domain classes are named `<Domain>API` and live in `domains/<domain>/module.ts`. They never call `fetch` directly — always go through `this.client`. They take the package's `BaseAPIContext` (an alias of the shared one, typed with the package's `Options`), so a domain API can be used standalone (it will create its own client) or share the parent client. Never re-implement the base in a service package; subclass it only to bind `Options` or add package-specific aliases.

**One options object per service client.** A service client with `Options` (`LokiClient`, `OAuth2Client`, `VictoriaLogsClient`) resolves `input.options || {}` once and passes that same object to every domain object (`OAuth2Client` also exposes it as `client.options`). A `setOption` on any domain object, or a mutation of that object, is therefore visible to all of them; only `setOptions` detaches a single domain object.

**Per-service base URL override.** A domain method that targets a separately deployed component spreads `...this.withBaseURL(this.options.<x>URL)` into its request options; an unset or empty value keeps the client's `baseURL`.

### Singleton instance registry

Both the base package and every service package expose an identical instance-management API backed by a keyed map (default key `'default'`):

```typescript
createClient(input?)      // construct a new client
useClient(key?)           // get-or-create the singleton for `key`
setClient(client, key?)   // register a client under `key`
hasClient(key?) / unsetClient(key?)
isClient(input)           // cross-realm marker check via matchesInstanceof
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

The factory keeps `setClient`/`useClient` generic over the client type, so the base package's `setClient<T>` / `useClient<T>` behavior is unchanged. `isClient` resolves purely through `matchesInstanceof(input, id)` — every client stamps that marker in its constructor (see below), so the marker check covers same- and cross-realm instances. When adding a new client package, call `createClientRegistry` rather than re-implementing the registry; a per-package test should assert `isClient(createClient())` to catch a wrong `id`.

### Cross-realm `instanceof` (`@instanceof` marker chain)

Because consumers may have duplicate copies of a package, `instanceof` alone is unreliable. hapic uses [`@ebec/core`](https://www.npmjs.com/package/@ebec/core)'s marker mechanism: each class calls `markInstanceof(this, Symbol.for(...))` in its constructor, which **appends** its marker to a non-enumerable `@instanceof` `symbol[]` on the instance. Because constructors run base→derived, an instance accumulates a marker for every class in its lineage — so one instance satisfies **multiple** `instanceof` references at once (an `HttpResponseError` is matched by both `isHttpResponseError` and `isClientError`). **Every `is*` guard tests the chain with `matchesInstanceof(input, Symbol.for(name))`** (re-exported from `packages/client/src/utils/instance.ts`, alongside the stricter `hasInstanceof`; the legacy `verifyInstanceBySymbol(input, name)` wrapper resolves `name` to its symbol and delegates to `matchesInstanceof`). The two differ in how strictly they read a chain entry: `hasInstanceof` matches only the `Symbol.for(...)` form an in-process instance carries, while `matchesInstanceof` (`hasInstanceof(input, marker, false)`) also matches the marker's *description string*. That matters because `JSON.stringify` drops symbols — `BaseError.toJSON()` emits the chain as strings, so a value that crossed a serialization boundary is only recognised by the loose form. Guards have no cheaper fallback to try afterwards, so the loose form is the right default for all of them — errors (`isHapicError`, `isClientError`, …), clients (`isClient`) and transports (`isTransport`) alike.

When adding a new client/error class, register its marker with `markInstanceof` in the constructor and add a matching `is*` guard built on `matchesInstanceof`.

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
