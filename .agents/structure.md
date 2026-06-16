# Project Structure

`hapic` is an npm-workspaces monorepo. The base HTTP client lives in `packages/client` (published as `hapic`); the remaining packages are service-specific clients that build on it, plus a private documentation site.

## Packages & Libraries

| Name                                                  | Package               | Description                                                                 |
|-------------------------------------------------------|-----------------------|-----------------------------------------------------------------------------|
| [packages/client](../packages/client)                | `hapic`               | Base fetch-based HTTP client: request methods, hooks, transformers, headers, errors. **Foundation package** — no internal deps. |
| [packages/harbor](../packages/harbor)                | `@hapic/harbor`       | Client for the [Harbor](https://goharbor.io/) container registry API (projects, repositories, artifacts, robots, webhooks). |
| [packages/loki](../packages/loki)                    | `@hapic/loki`         | Client for [Grafana Loki](https://grafana.com/oss/loki/) (querier, distributor, compactor). |
| [packages/oauth2](../packages/oauth2)                | `@hapic/oauth2`       | OAuth2 / OpenID Connect client (authorize, token, userinfo, provider metadata). |
| [packages/vault](../packages/vault)                  | `@hapic/vault`        | Client for [HashiCorp Vault](https://www.vaultproject.io/) (key-value v1/v2, mounts). |
| [packages/victorialogs](../packages/victorialogs)    | `@hapic/victorialogs` | Client for [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/) (ingestor, querier). |
| [packages/docs](../packages/docs)                    | `@hapic/docs`         | VitePress documentation site (private, not published).                      |

## Package Dependency Layers

Internal dependencies are declared as `peerDependencies` (with `hapic` also listed under `devDependencies` for local builds/tests). Always consult each package's `package.json` for the authoritative graph.

```
Foundation (no internal deps):
  hapic                       (packages/client)

Layer 1 (peerDependency: hapic):
  @hapic/harbor               (packages/harbor)
  @hapic/loki                 (packages/loki)
  @hapic/oauth2               (packages/oauth2)
  @hapic/vault                (packages/vault)
  @hapic/victorialogs         (packages/victorialogs)

Docs (not published):
  @hapic/docs                 (packages/docs)
```

A change to `hapic` (the base `Client`, request/response/hook types, or error helpers) potentially affects **every** other package. Nx `build` depends on `^build`, so building any service client rebuilds `hapic` first.

## Base Package Layout (`packages/client`)

```
packages/client/src/
├── index.ts            # Barrel re-exports + a default `createClient()` instance (export default)
├── module.ts           # Client class — request(), get/post/put/patch/delete/head(), header & hook management
├── instance.ts         # Singleton registry: create/use/set/has/unsetClient, isClient
├── constants.ts        # ResponseType, MethodName enums
├── fetch.ts            # Cross-env fetch/Headers/Blob/FormData/AbortController + proxy (node-fetch-native)
├── request/            # RequestBaseOptions/RequestOptions types, defaults, payload helpers, transformers
├── response/           # Response type, response-type detection, status/type checks
├── hook/               # HookManager, HookName enum, request/response/error hook fn types
├── header/             # Header name constants + authorization header (Basic / Bearer / api-key)
├── error/              # ClientError (ebec-based), ErrorCode, isClientError* helpers
└── utils/              # has-own-property, verifyInstanceBySymbol, promise, serialize, traverse, type-check
```

## Service Client Layout (e.g. `packages/harbor`)

Every service client follows the same shape:

```
packages/<service>/src/
├── index.ts            # Barrel: re-exports module, instance, config, domains, types
├── module.ts           # <Service>Client extends Client (from hapic) — composes domain *API instances
├── instance.ts         # Per-service singleton registry (create/use/set/has/unsetClient, isClient)
├── client.ts           # Re-exports selected base types/helpers from `hapic` (Response, ClientError, …)
├── constants.ts        # Service-specific constants (e.g. extra header names)
├── config/             # Config / ConfigInput types (request options + connectionString/connectionOptions)
├── type.ts             # Top-level shared types for the package
├── domains/            # One subdirectory per API domain
│   ├── base.ts         #   abstract BaseAPI — holds the `client` reference
│   ├── index.ts        #   barrel of all domain APIs
│   ├── type.ts         #   BaseAPIContext, shared collection/query/response types
│   └── <domain>/
│       ├── module.ts   #     <Domain>API extends BaseAPI — the endpoint methods
│       ├── type.ts     #     request/response payload types for the domain
│       ├── index.ts    #     barrel
│       └── (constants.ts | utils.ts | helper.ts as needed)
├── error/              # Service-specific errors (e.g. connection-string parse errors) — harbor/vault
└── utils/              # Service-specific helpers (connection string, query string, resource id/meta)
```

`@hapic/oauth2` additionally has an `open-id/` directory (OpenID Connect client, provider metadata, URL helpers). `@hapic/vault` keeps key-value engine variants under `domains/key-value/{v1,v2}.ts`.

## Package Exports

Every published package exposes a single entry point with dual CJS/ESM builds and types:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist/"]
}
```

The public API of each package is whatever its `src/index.ts` barrel re-exports. Anything not re-exported from `index.ts` is internal.

## Separation of Concerns

- **Transport / request lifecycle** → `packages/client` (`Client`, hooks, transformers, fetch wrapper).
- **Service endpoint logic** → each service package's `domains/<domain>/module.ts` (`*API` classes).
- **Connection / auth config** → each service package's `config/` + `module.ts` `applyConfig()`.
- **Singleton lifecycle** → each package's `instance.ts`.
- **Cross-package type/helper sharing** → re-export from `hapic` (never duplicate base types).
