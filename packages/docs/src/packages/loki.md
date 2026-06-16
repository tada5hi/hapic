# @hapic/loki

A client for [Grafana Loki](https://grafana.com/oss/loki/) — push log streams through the distributor, query them with LogQL through the querier, and schedule deletions through the compactor. It extends the base [`Client`](/guide/client).

## Installation

```bash
npm install hapic @hapic/loki --save
```

## Creating a client

`LokiClient` defaults its `baseURL` to `http://localhost:3100/`. Override it for a remote cluster, and set `X-Scope-OrgID` for multi-tenant deployments.

```typescript
import { createClient } from '@hapic/loki';

const client = createClient({
    request: {
        baseURL: 'https://loki.example.com:3100/',
        headers: {
            'X-Scope-OrgID': 'tenant-a',   // required when multi-tenancy is on
        },
    },
});
```

For micro-services deployments where components live at different URLs, set them under `options`:

```typescript
const client = createClient({
    options: {
        distributorURL: 'https://distributor.example.com:3100/',
        querierURL: 'https://querier.example.com:3100/',
        compactorURL: 'https://compactor.example.com:3100/',
    },
});
```

The package exports the usual registry (`createClient`, `useClient`, `setClient`, …) plus a `nanoSeconds()` helper for timestamps.

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.distributor` | `DistributorAPI` | `push(stream)` · `pushMany(streams)` |
| `client.querier` | `QuerierAPI` | `query(options)` · `queryRange(options)` |
| `client.compactor` | `CompactorAPI` | `createDeletionRequest(params)` · `cancelDeletionRequest(params)` |

::: tip Timestamps are nanoseconds
Loki works in **nanosecond** Unix epochs. Pass them as `bigint`, `string`, or `number`. The exported `nanoSeconds()` returns "now" as a `bigint`.
:::

## Pushing logs

```typescript
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

await client.distributor.push({
    stream: { app: 'api', env: 'production', level: 'info' },
    values: [
        [nanoSeconds(), 'user logged in'],
        [nanoSeconds(), 'request completed in 42ms'],
    ],
});
```

Push several streams in one request with `pushMany`:

```typescript
await client.distributor.pushMany([
    { stream: { app: 'web' }, values: [[nanoSeconds(), 'page rendered']] },
    { stream: { app: 'api' }, values: [[nanoSeconds(), 'db query ok']] },
]);
```

## Querying

`query` evaluates a LogQL expression at a single instant; `queryRange` evaluates it over a window. The result's `data.resultType` discriminates between `streams` (log lines) and `vector` (metric values).

```typescript
const result = await client.querier.query({
    query: '{app="api", level="error"}',
    limit: 100,
    direction: 'backward',
});

if (result.status === 'success' && result.data.resultType === 'streams') {
    for (const entry of result.data.result) {
        for (const [ts, line] of entry.values) {
            console.log(ts, line);
        }
    }
}
```

```typescript
const range = await client.querier.queryRange({
    query: 'rate({job="api"} | logfmt | level="error" [5m])',
    start: nanoSeconds() - 3_600_000_000_000n,  // one hour ago
    end: nanoSeconds(),
    step: '30s',
});
```

## Deletions

```typescript
// schedule deletion of matching log lines
await client.compactor.createDeletionRequest({
    query: '{app="api"}',
    start: nanoSeconds() - 86_400_000_000_000n,  // 24h ago
});

// cancel a pending request
await client.compactor.cancelDeletionRequest({ request_id: '<id>' });
```

> The compactor's deletion API requires retention deletion to be enabled on your Loki deployment.
