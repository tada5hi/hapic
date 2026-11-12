# VictoriaLogs reference

Read before changing `packages/victorialogs`. The mapping is taken from the client code and has not been checked against upstream yet.

Source of truth: [querying HTTP API](https://docs.victoriametrics.com/victorialogs/querying/), [data ingestion](https://docs.victoriametrics.com/victorialogs/data-ingestion/).

## Endpoint mapping

| Upstream | This project (`packages/victorialogs/src/domains/`) |
|---|---|
| `POST /insert/jsonline` | `ingestor/module.ts` `insert` |
| `GET /select/logsql/query` (NDJSON response, one log entry per line) | `querier/module.ts` `query` |
