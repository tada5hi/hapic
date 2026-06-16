# @hapic/victorialogs

A client for [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/) — ingest JSON-line logs and query them with LogsQL. It extends the base [`Client`](/guide/client).

## Installation

```bash
npm install hapic @hapic/victorialogs --save
```

## Creating a client

`VictoriaLogsClient` defaults its `baseURL` to `http://localhost:9428/`. Override it for a remote instance, or split ingest and query endpoints under `options`.

```typescript
import { createClient } from '@hapic/victorialogs';

const client = createClient({
    request: {
        baseURL: 'https://logs.example.com:9428/',
    },
});
```

```typescript
const client = createClient({
    options: {
        ingesterURL: 'https://ingest.example.com:9428',
        querierURL: 'https://query.example.com:9428',
    },
});
```

The package exports the usual registry (`createClient`, `useClient`, `setClient`, …) — see [Instance Registry](/guide/instance).

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.ingestor` | `IngestorAPI` | `insert(data)` |
| `client.querier` | `QuerierAPI` | `query(options)` |

## Ingesting logs

An entry requires a `_msg`; `_time` and `_stream` are optional, and any extra fields are stored alongside. `insert` posts to VictoriaLogs' JSON-line ingestion endpoint.

```typescript
import { createClient, type IngestorData } from '@hapic/victorialogs';

const client = createClient();

const entry: IngestorData = {
    _msg: 'application started',
    _time: new Date().toISOString(),
    _stream: 'app/startup',
    service: 'user-api',
    version: '1.2.3',
};

await client.ingestor.insert(entry);
```

## Querying logs

`query` runs a [LogsQL](https://docs.victoriametrics.com/victorialogs/logsql/) expression and returns an array of matching entries. The response stream is parsed for you into plain objects.

```typescript
const results = await client.querier.query({
    query: 'service:user-api AND level:error',
    limit: 100,
    start: '2026-01-07T09:00:00Z',
    end: '2026-01-07T10:00:00Z',
});

for (const entry of results) {
    console.log(entry._time, entry._msg);
}
```

`QuerierQueryOptions` supports `query` (required), plus optional `limit`, `offset`, `start`, `end`, and `timeout` (e.g. `'5s'`). Each result item carries `_msg`, `_time`, `_stream`, `_stream_id`, and any custom fields from the matched logs.

## Error handling

Failures surface as the base [`ClientError`](/guide/errors), with the guards re-exported from `hapic`:

```typescript
import { isClientError } from '@hapic/victorialogs';

try {
    await client.querier.query({ query: 'invalid::' });
} catch (error) {
    if (isClientError(error)) {
        console.error(error.status, error.message);
    }
}
```
