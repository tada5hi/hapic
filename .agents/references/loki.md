# Loki reference

Read before changing `packages/loki`. The mapping is taken from the client code and has not been checked against upstream yet.

Source of truth: [Loki HTTP API](https://grafana.com/docs/loki/latest/reference/loki-http-api/).

## Endpoint mapping

| Upstream | This project (`packages/loki/src/domains/`) |
|---|---|
| `POST /loki/api/v1/push` | `distributor/module.ts` `push`, `pushMany` |
| `GET /loki/api/v1/query` | `querier/module.ts` `query` |
| `GET /loki/api/v1/query_range` | `querier/module.ts` `queryRange` |
| `POST /loki/api/v1/delete` | `compactor/module.ts` `createDeletionRequest` |
| `DELETE /loki/api/v1/delete` | `compactor/module.ts` `cancelDeletionRequest` |

Each domain can target its own base URL through the client options, because distributor, querier and compactor may run as separate services.
