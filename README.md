<p align="center">
    <img src="./packages/client/assets/logo.svg" alt="hapic logo" width="120" />
</p>

<h1 align="center">hapic</h1>

<p align="center">
    <b>A fetch-based HTTP client for Node.js, browsers and workers.</b><br>
    You stop writing base URL joins, JSON encoding, status checks and timeout plumbing around <code>fetch</code>,<br>
    and the typed clients for Harbor, Loki, OAuth2, Vault and VictoriaLogs run on the same core.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/hapic"><img src="https://img.shields.io/npm/v/hapic" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net"><b>Documentation</b></a>
    ·
    <a href="#why-hapic">Why hapic?</a>
    ·
    <a href="#packages">Packages</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#quick-start">Quick start</a>
    ·
    <a href="#development">Development</a>
</p>

---

## Why hapic?

`fetch` sends a request and hands you a response. Everything around it is yours to write, in every project: joining a base URL and a query string, encoding the body as JSON, checking `response.ok` because a `404` resolves, choosing between `.json()` and `.text()`, wiring an `AbortSignal` for a timeout, retrying after a token refresh. Each service API then adds its own URLs and payload shapes on top.

hapic is that layer, written once, in a `Client` class that the service clients extend:

| Concern | With `fetch` alone | With hapic |
|---|---|---|
| **URLs** | `new URL(path, base)` and `URLSearchParams` by hand at each call | `baseURL` on the client, `query` per request; `bigint` values become strings |
| **JSON bodies** | `JSON.stringify` and a `content-type` header at each call | plain objects are encoded and `content-type` / `accept` are set |
| **Failed statuses** | a `404` or `500` resolves; you check `response.ok` and throw yourself | 400 to 599 rejects with an `HttpResponseError` that carries the decoded body |
| **Decoding** | you pick `.json()` or `.text()`; `.json()` throws on an empty or HTML body | read by `responseType` or `Content-Type`; invalid JSON falls back to text; server-sent events stay a stream |
| **Auth** | build `Basic` base64 or `Bearer` strings yourself | `setAuthorizationHeader({ type: 'Bearer', token })` for every request |
| **Token refresh, fallbacks** | wrap every call site | an error hook returns `RequestOptions` to retry, or a `Response` to resolve |
| **Timeouts** | combine `AbortSignal.timeout()` with your own signal, classify the abort | `timeout` option; rejects with code `ETIMEDOUT`, checked by `isClientErrorDueTimeout` |
| **Proxies** | Node.js `fetch` does not read `HTTPS_PROXY` by default; you configure a dispatcher | the proxy environment variables are read by default in Node.js |
| **Tests** | stub the global `fetch` | `MemoryTransport` records requests while the real pipeline runs |
| **Service APIs** | hand-written URLs and payload types per endpoint | `@hapic/*` clients with typed domain APIs on the same `Client` |

The same request, two ways:

```typescript
import { createClient } from 'hapic';

const token = 'my-token';

// fetch
const url = new URL('users', 'https://api.example.com/');
url.searchParams.set('notify', 'true');

const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Peter' }),
    signal: AbortSignal.timeout(5_000),
});

if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
}

const user = await response.json();

// hapic
const client = createClient({ baseURL: 'https://api.example.com/', timeout: 5_000 });
client.setAuthorizationHeader({ type: 'Bearer', token });

const { data } = await client.post('users', { name: 'Peter' }, { query: { notify: true } });
```

Every call, from the base client or a service client, runs through one pipeline. Hooks and transformers plug into it, and an error hook can answer a failure or send the request again:

<p align="center">
    <img src="./packages/client/assets/request-lifecycle.svg" alt="The hapic request lifecycle. Every call runs through Client.request. resolveRequestOptions merges the client defaults, headers and query, the request hooks may replace the options, options.transform turns the body into JSON by default, and transport.dispatch sends it. decodeResponse reads the body by responseType and runs responseTransform. A status below 400 runs the response hooks and resolves with the Response and its data. A status from 400 to 599 runs the responseError hooks with an HttpResponseError; a dispatch that fails, aborts or times out runs the requestError hooks with a NetworkError. An error hook that returns a Response resolves with it, one that returns RequestOptions runs request again from the start, and when no hook recovers the call rejects with the ClientError." width="100%" />
</p>

The [`hapic` README](./packages/client#readme) covers each step: options, hooks, transformers, responses, timeouts, errors, transports and the instance registry.

## Packages

| Package | Version | Description |
|---|---|---|
| [`hapic`](./packages/client) | [![npm](https://img.shields.io/npm/v/hapic?label=)](https://www.npmjs.com/package/hapic) | The base client: request methods, hooks, transformers, headers and authorization, timeouts, errors, transports, proxy. |
| [`@hapic/harbor`](./packages/harbor) | [![npm](https://img.shields.io/npm/v/@hapic/harbor?label=)](https://www.npmjs.com/package/@hapic/harbor) | [Harbor](https://goharbor.io/) container registry: projects, repositories, artifacts, robot accounts, webhooks. |
| [`@hapic/loki`](./packages/loki) | [![npm](https://img.shields.io/npm/v/@hapic/loki?label=)](https://www.npmjs.com/package/@hapic/loki) | [Grafana Loki](https://grafana.com/oss/loki/): push and query logs through the distributor, querier and compactor endpoints. |
| [`@hapic/oauth2`](./packages/oauth2) | [![npm](https://img.shields.io/npm/v/@hapic/oauth2?label=)](https://www.npmjs.com/package/@hapic/oauth2) | OAuth2 and OpenID Connect: authorize URLs, token requests, userinfo, provider metadata. |
| [`@hapic/vault`](./packages/vault) | [![npm](https://img.shields.io/npm/v/@hapic/vault?label=)](https://www.npmjs.com/package/@hapic/vault) | [HashiCorp Vault](https://www.vaultproject.io/): key-value engines v1 and v2, mounts. |
| [`@hapic/victorialogs`](./packages/victorialogs) | [![npm](https://img.shields.io/npm/v/@hapic/victorialogs?label=)](https://www.npmjs.com/package/@hapic/victorialogs) | [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/): ingest and query logs. |

Each service client is a `<Service>Client` that extends `Client` and groups its endpoints into domain APIs (`client.project`, `client.robot`, ...). Hooks, headers, timeouts and the `is*` error guards of the base client work on all of them. The [Building a Service Client](https://hapic.tada5hi.net/guide/building-a-client) guide shows how to write your own.

## Installation

```bash
npm install hapic --save
```

A service client declares `hapic` as a peer dependency, so install both:

```bash
npm install hapic @hapic/harbor --save
```

All packages are ESM only and need Node.js `>=22.0.0`; the base client also runs in browsers and workers on the platform `fetch`.

## Quick start

```typescript
import { createClient, isHttpResponseError } from 'hapic';

const client = createClient({
    baseURL: 'https://api.example.com/',
    timeout: 10_000,
});

client.setAuthorizationHeader({ type: 'Bearer', token: 'my-token' });

try {
    const { data } = await client.get('users', { query: { page: 1 } });
    console.log(data);
} catch (error) {
    if (isHttpResponseError(error)) {
        console.error(error.status, error.response?.data);
    }
}
```

A service client takes its request options under `request` and a `credentials@host` connection string:

```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    connectionString: 'admin:secret@https://registry.example.com/api/v2.0/',
    request: { timeout: 10_000 },
});

const project = await harbor.project.getOne(1);
```

Continue with the [getting started guide](https://hapic.tada5hi.net/getting-started/) or the [`hapic` README](./packages/client#readme).

## Development

```bash
npm ci             # install
npm run build      # build all packages (Nx, cached)
npm run test       # run every package's tests (Vitest)
npm run lint       # ESLint
```

- Development needs Node.js `^24.15.0` or `>=26.0.0`. A service client's tests import the built `hapic`, so run `npm run build` first.
- `npm run dev --workspace=packages/docs` serves the [documentation site](https://hapic.tada5hi.net) locally.

## Contributing

Commits follow [Conventional Commits](https://conventionalcommits.org) and are checked by commitlint; `npm run commit` opens an interactive prompt. Releases and changelogs are generated from the commit messages by release-please.

## License

Made with 💚

Published under [MIT License](./LICENSE).
