# Packages

Beyond the base `hapic` client, the project ships a family of **service clients** under the `@hapic/*` scope. Each one extends the same base `Client` with a typed, domain-oriented API for a specific backend — so they share the transport, hooks, authorization helpers, and [instance registry](/guide/instance) you already know.

## The family

| Package | For | Highlights |
|---------|-----|-----------|
| [`@hapic/harbor`](/packages/harbor) | [Harbor](https://goharbor.io/) container registry | projects, repositories, artifacts, robot accounts, webhooks |
| [`@hapic/oauth2`](/packages/oauth2) | OAuth2 / OpenID Connect | every token grant, introspection, userinfo, OpenID discovery |
| [`@hapic/vault`](/packages/vault) | [HashiCorp Vault](https://www.vaultproject.io/) | key-value v1 & v2 secret engines, mount management |
| [`@hapic/loki`](/packages/loki) | [Grafana Loki](https://grafana.com/oss/loki/) | push streams, LogQL instant & range queries, deletion requests |
| [`@hapic/victorialogs`](/packages/victorialogs) | [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/) | JSON-line ingestion, LogsQL queries |

## What they all share

Because every service client **is** a `Client`, the patterns are identical across the family:

- **Construction** — `new <Service>Client(config)` or the package's `createClient(config)`.
- **Instance registry** — each package exports its own `createClient` / `useClient` / `setClient` / `hasClient` / `unsetClient` / `isClient`.
- **Domain APIs** — endpoints are grouped into `*API` objects exposed as properties (e.g. `client.project`, `client.token`, `client.keyValueV2`).
- **The base client underneath** — set headers, register [hooks](/guide/hooks), add [transformers](/guide/transformers), and catch [`ClientError`](/guide/errors) exactly as documented in the guide.

```typescript
// the same mental model, whichever package you pick
import { createClient } from '@hapic/harbor';

const client = createClient({
    connectionString: 'admin:secret@https://registry.example.com/api/v2.0/',
});

// a base-client hook still works on a service client
client.on('responseError', (error) => { throw error; });

const projects = await client.project.getMany();
```

## Configuration

Service clients take a `ConfigInput` (a partial `Config`). It threads base request options straight to the `Client`, and resolves connection details into a `baseURL` + auth header:

```typescript
type Config = {
    request: RequestBaseOptions;          // baseURL, headers, proxy, transformers…
    connectionString?: string;            // "user:password@host" (where supported)
    connectionOptions?: ConnectionOptions; // structured host/credentials
    options?: ServiceSpecificOptions;     // e.g. OAuth2 endpoints, Loki component URLs
};
```

The exact fields differ per service — each package page documents its own. Re-exported base types (`Response`, `ClientError`, `RequestBaseOptions`, the `isClientError*` guards) come straight from `hapic`, so you never duplicate them.

## Building your own

Want a typed client for an API that isn't in the list? The [Building a Service Client](/guide/building-a-client) guide walks through the exact pattern these packages use.
