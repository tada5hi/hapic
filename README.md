<p align="center">
  <img src="https://hapic.tada5hi.net/logo.svg" alt="hapic" width="120" />
</p>

<h1 align="center">hapic</h1>

<p align="center">
  <b>The tiny, fetch-based HTTP API client.</b><br>
  Request & response hooks, transformers, authorization helpers and proxy support —<br>
  plus a family of typed service clients built on the same core.
</p>

<p align="center">
  <a href="https://github.com/Tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/hapic"><img src="https://img.shields.io/npm/v/hapic?label=hapic" alt="npm version" /></a>
  <a href="https://snyk.io/test/github/Tada5hi/hapic"><img src="https://snyk.io/test/github/Tada5hi/hapic/badge.svg" alt="Known Vulnerabilities" /></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
</p>

<p align="center">
  <a href="https://hapic.tada5hi.net"><b>Documentation</b></a>
  ·
  <a href="https://hapic.tada5hi.net/getting-started/">Getting Started</a>
  ·
  <a href="https://hapic.tada5hi.net/guide/">Guide</a>
  ·
  <a href="https://hapic.tada5hi.net/packages/">Packages</a>
</p>

---

## Why hapic?

Most HTTP libraries sit at one of two extremes: a bare `fetch` wrapper where you re-solve auth, JSON handling and error throwing on every project — or a heavyweight SDK locked to a single backend. hapic splits the difference. A tiny base `Client` owns the **transport** — and typed service clients extend it for specific **backends**.

```ts
// the base client — fetch with batteries
import hapic from 'hapic';

const { data } = await hapic.post('https://api.example.com/users', { name: 'Max' });

// a typed service client built on that same core
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({ connectionString: 'admin:pw@https://registry.example.com/api/v2.0/' });
const project = await harbor.project.getOne(1);   // typed call → no URL building, no manual decoding
```

That split serves two audiences:

- **App developers** get `fetch` with batteries included — `baseURL`, authorization headers, JSON in/out, errors that throw on non-2xx, proxy support, and hooks for retry/refresh-token flows — in a package small enough to drop into the browser, Node.js or a worker.
- **Service-client authors** get a transport contract: extend `Client`, declare a few domain `*API` classes, and inherit the entire request lifecycle — hooks, transformers, error handling and cross-environment `fetch` — instead of re-implementing it per backend. The `@hapic/*` clients in this repo are exactly that pattern, shipped.

### Features

- ✨ **Simple API** — `get` / `post` / `put` / `patch` / `delete` / `head` shortcuts over a single `request()`.
- 🛑 **Hooks** to intercept and mutate requests, responses and errors — error hooks can even recover a failed request (retry / refresh token).
- 🔄 **Transformers** for request payloads & headers.
- 🔐 **Authorization helpers** — `Basic`, `Bearer` and `api-key` headers from a typed config.
- ❌ **Throws on non-2xx** — every `400–599` response becomes a typed `HttpResponseError`; network failures become a `NetworkError`.
- 🎭 **Proxy support** out of the box.
- 🌐 **Runs everywhere** — Node.js, the browser and worker environments, through one cross-env `fetch` layer.
- 🧩 **Typed service clients** for Harbor, Loki, OAuth2, Vault and VictoriaLogs — all on the same core.

## Getting Started

```bash
npm install hapic
```

```ts
import hapic, { createClient } from 'hapic';

// use the default singleton instance...
const response = await hapic.post('https://api.example.com/users', {
    firstName: 'Max',
    lastName: 'Mustermann',
});

console.log(response);
// { data: …, headers: …, status: …, statusText: … }

// ...or create a configured client
const client = createClient({
    baseURL: 'https://api.example.com/',
});

const { data } = await client.get('users/1');
```

Follow the full walkthrough at **[hapic.tada5hi.net/getting-started](https://hapic.tada5hi.net/getting-started/)**.

## The request lifecycle

Every `request(config)` runs through the same pipeline. Hooks and transformers slot into it, so cross-cutting concerns live in one place instead of at every call site:

```text
request(config)
  1. merge headers over the client defaults
  2. resolve URL          baseURL + params/query
  3. request hooks    ←   intercept / mutate the outgoing request
  4. transformers     ←   reshape the body
  5. dispatch             fetch(url, init)  (with optional proxy)
  6. decode               by responseType, or detected from Content-Type
  7. throw on 4xx–5xx ←   error hooks may recover: return a Response, or retry
  8. response hooks   ←   inspect / transform the result
```

```ts
import { createClient, HookName } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

// attach a bearer token on every request
client.on(HookName.REQUEST, (request) => ({
    ...request,
    headers: { ...request.headers, authorization: `Bearer ${token}` },
}));

// recover from a 401 by refreshing the token and retrying
client.on(HookName.REQUEST_ERROR, async (error) => {
    if (error.response?.status === 401) {
        token = await refreshToken();
        return error.request;   // returning RequestOptions retries the request
    }
});
```

→ Deep dive: [The Client](https://hapic.tada5hi.net/guide/client) · [Hooks](https://hapic.tada5hi.net/guide/hooks) · [Transformers](https://hapic.tada5hi.net/guide/transformers) · [Error Handling](https://hapic.tada5hi.net/guide/errors) · [Building a Service Client](https://hapic.tada5hi.net/guide/building-a-client)

## Packages

### Base

| Package | Version | Description |
|---|---|---|
| [`hapic`](./packages/client) | [![npm](https://img.shields.io/npm/v/hapic?label=)](https://www.npmjs.com/package/hapic) | Base fetch-based HTTP client — request methods, hooks, transformers, headers, authorization, proxy and auto-throwing errors. The foundation every other package builds on. |

### Service Clients

| Package | Version | Description |
|---|---|---|
| [`@hapic/harbor`](./packages/harbor) | [![npm](https://img.shields.io/npm/v/@hapic/harbor?label=)](https://www.npmjs.com/package/@hapic/harbor) | Typed client for the [Harbor](https://goharbor.io/) container registry — projects, repositories, artifacts, robots, webhooks and more. |
| [`@hapic/loki`](./packages/loki) | [![npm](https://img.shields.io/npm/v/@hapic/loki?label=)](https://www.npmjs.com/package/@hapic/loki) | Client for [Grafana Loki](https://grafana.com/oss/loki/) — push, query and analyze logs through the querier, distributor and compactor endpoints. |
| [`@hapic/oauth2`](./packages/oauth2) | [![npm](https://img.shields.io/npm/v/@hapic/oauth2?label=)](https://www.npmjs.com/package/@hapic/oauth2) | OAuth2 / OpenID Connect client — authorization flows, token issuance, userinfo and provider metadata. |
| [`@hapic/vault`](./packages/vault) | [![npm](https://img.shields.io/npm/v/@hapic/vault?label=)](https://www.npmjs.com/package/@hapic/vault) | Client for [HashiCorp Vault](https://www.vaultproject.io/) — key-value engines (v1/v2), mounts and secrets management. |
| [`@hapic/victorialogs`](./packages/victorialogs) | [![npm](https://img.shields.io/npm/v/@hapic/victorialogs?label=)](https://www.npmjs.com/package/@hapic/victorialogs) | Client for [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/) — ingest and query logs via its HTTP API. |

Every service client follows the same shape — a `<Service>Client extends Client` composing domain `*API` classes — so once you know one, you know them all. See [Building a Service Client](https://hapic.tada5hi.net/guide/building-a-client) to publish your own.

## Contributing

```bash
npm ci             # install
npm run build      # build all packages (Nx, cached)
npm run test       # run tests
npm run lint       # ESLint — must pass with zero errors
```

Commits follow [Conventional Commits](https://conventionalcommits.org); releases and changelogs are automated via release-please.

## License

Made with 💚

Published under [MIT License](./LICENSE).
