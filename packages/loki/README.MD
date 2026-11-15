<p align="center">
    <img src="./assets/logo.svg" alt="@hapic/loki logo" width="120" />
</p>

<h1 align="center">@hapic/loki</h1>

<p align="center">
    <b>Typed HTTP client for Grafana Loki: push log streams, run LogQL queries and manage deletion requests.</b><br>
    You stop assembling push bodies, encoding nanosecond timestamps and LogQL query strings by hand,<br>
    and you point the distributor, querier and compactor at their own base URLs from one options object.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hapic/loki"><img src="https://img.shields.io/npm/v/@hapic/loki" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net/packages/loki"><b>Documentation</b></a>
    ·
    <a href="#why-hapicloki">Why</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#configuration">Configuration</a>
    ·
    <a href="#distributor">Distributor</a>
    ·
    <a href="#querier">Querier</a>
    ·
    <a href="#compactor">Compactor</a>
    ·
    <a href="#errors">Errors</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why @hapic/loki?

Talking to Loki's HTTP API with plain `fetch` means writing the same glue in every project: the `{ streams: [...] }` push body, timestamps as nanosecond strings (`JSON.stringify` throws on a `bigint`, and `Date.now()` counts milliseconds), URL-encoded LogQL, a check of `response.ok` after every call and, once Loki runs as separate components, one base URL per component.

| Concern | Without it (`fetch`) | With `@hapic/loki` |
|---|---|---|
| **Push body** | You build `{ streams: [{ stream, values }] }` and set the `content-type` header. | `distributor.push(stream)` and `pushMany(streams)` build the body and the header. |
| **Nanosecond timestamps** | You turn milliseconds into a nanosecond string, because `JSON.stringify` rejects a `bigint`. | A `bigint` timestamp is sent as a string, in the body and in the query string. `nanoSeconds()` returns the current time as a `bigint`. |
| **LogQL in the query string** | You URL-encode `{app="api"}` and every other parameter. | Query parameters are a typed object; the client encodes them. |
| **Separate components** | Distributor, querier and compactor can each have their own URL, and you keep track of them. | One `options` object with `distributorURL`, `querierURL` and `compactorURL`; each falls back to the client's `baseURL`. |
| **Error statuses** | `fetch` resolves on a 4xx or 5xx; you check `response.ok`. | A 4xx or 5xx rejects with an `HttpResponseError` that carries the status and the response body. |
| **Result shape** | `await response.json()` is `any`. | `QuerierQueryResult`, discriminated by `data.resultType` (`streams` or `vector`). |

The same push, two ways:

```typescript
// fetch
const response = await fetch('http://localhost:3100/loki/api/v1/push', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
        streams: [
            { stream: { app: 'api' }, values: [[`${Date.now()}000000`, 'user logged in']] },
        ],
    }),
});

if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
}
```

```typescript
// @hapic/loki
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

await client.distributor.push({
    stream: { app: 'api' },
    values: [[nanoSeconds(), 'user logged in']],
});
```

## Installation

```bash
npm install hapic @hapic/loki --save
```

- ESM only (`import`, no `require`).
- Node.js `>=22.0.0`. The client is built on `fetch`, so it also runs in browsers and workers.
- `hapic` is a peer dependency: `LokiClient` extends its `Client`, so install both.

## Configuration

```typescript
import { createClient } from '@hapic/loki';

const client = createClient({
    request: {
        baseURL: 'https://loki.example.com/',
        headers: { 'X-Scope-OrgID': 'tenant-a' },
        timeout: 10_000,
    },
    options: {
        querierURL: 'https://loki-read.example.com/',
    },
});
```

`createClient(config)` and `new LokiClient(config)` take the same object:

| Key | Type | Description |
|---|---|---|
| `request` | `ClientOptionsInput` from `hapic` | Options of the underlying `hapic` client: `baseURL`, `headers`, `timeout` (milliseconds), `proxy`, `transport` and every `fetch` `RequestInit` option. `baseURL` defaults to `http://localhost:3100/`. The object you pass is copied, not modified. All options: [The Client](https://hapic.tada5hi.net/guide/client). |
| `options` | `Options` | Per-component base URLs, see [Component base URLs](#component-base-urls). |

Headers in `request.headers`, or set later with `client.setHeader()`, go with every request. The inherited `client.setAuthorizationHeader({ type: 'Basic', username, password })` (also `Bearer` and API-key forms) sets the `Authorization` header.

### Component base URLs

When Loki runs as separate components, each domain object can send its requests to its own base URL:

```typescript
import { createClient } from '@hapic/loki';
import type { Options } from '@hapic/loki';

const options: Options = {
    distributorURL: 'http://distributor:3100/',
    querierURL: 'http://querier:3100/',
};

const client = createClient({
    request: { baseURL: 'http://loki-gateway:3100/' },
    options,
});

// writes into the shared object: options.compactorURL is set now as well
client.compactor.setOption('compactorURL', 'http://compactor:3100/');
```

| Option | Used by | Methods |
|---|---|---|
| `distributorURL` | `client.distributor` | `push`, `pushMany` |
| `querierURL` | `client.querier` | `query`, `queryRange` |
| `compactorURL` | `client.compactor` | `createDeletionRequest`, `cancelDeletionRequest` |
| `ingesterURL`, `indexGatewayURL`, `querySchedulerURL`, `rulerURL` | none | Accepted by the type; no method of this package reads them. |

- A request uses the option of its component when it is set and not empty, and the client's `baseURL` otherwise.
- All domain objects of one client share **one options object**: the object you pass as `options`, or a new empty object when you pass none. They keep a reference, not a copy, so when you change your object, the next request goes to the new URL.
- `setOption(key, value)` on any domain object writes `key` into that shared object, so every domain object of the client sees it.
- `setOptions(options)` replaces the options object of **that one domain object** (with an empty object when called without an argument). From then on it no longer shares options with the others, and a later `setOption` on another domain object does not reach it.
- Options are read when a request is built, so a change applies from the next request on.

### Using a domain object on its own

```typescript
import { QuerierAPI } from '@hapic/loki';

const querier = new QuerierAPI({
    client: { baseURL: 'http://querier:3100/' },
});
```

Every domain class takes `{ client, options }`. `client` is either an existing client (a `LokiClient` or any `hapic` client) or request options. With request options, or without `client`, the domain object creates a plain `hapic` client, which has no default base URL: the `http://localhost:3100/` default belongs to `LokiClient`.

## Distributor

`client.distributor` (`DistributorAPI`) pushes log entries with `POST loki/api/v1/push`, against `distributorURL` or the client's `baseURL`.

### `push`

```typescript
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

await client.distributor.push({
    stream: { app: 'api', env: 'production' },
    values: [
        [nanoSeconds(), 'user logged in'],
        [nanoSeconds(), 'request completed', { trace_id: 'abc123' }],
    ],
});
```

- `push(stream)` sends one stream; it calls `pushMany([stream])`.
- A stream (`DistributorPushStream`) has optional `stream` labels (`Record<string, string>`) and `values`, a list of `[timestamp, line]` or `[timestamp, line, metadata]` tuples. The timestamp is a nanosecond epoch as `string` or `bigint`; `metadata` is a `Record<string, string>` sent as the third element.
- The body is JSON, sent with `content-type: application/json`. A `bigint` is written as a string (`1000n` becomes `"1000"`).
- Resolves to `undefined` once Loki answers with a 2xx.

### `pushMany`

```typescript
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

await client.distributor.pushMany([
    { stream: { app: 'web' }, values: [[nanoSeconds(), 'page rendered']] },
    { stream: { app: 'api' }, values: [[nanoSeconds(), 'db query ok']] },
]);
```

- Sends all streams in one request as `{ "streams": [...] }`.
- Same encoding and result as `push`.

## Querier

`client.querier` (`QuerierAPI`) runs LogQL queries against `querierURL` or the client's `baseURL`. Both methods send `accept: application/json`, pass their options as query string parameters and return the parsed JSON body unchanged.

### `query`

```typescript
import { createClient } from '@hapic/loki';

const client = createClient();

const result = await client.querier.query({
    query: '{app="api"} |= "error"',
    limit: 100,
    direction: 'backward',
});

if (result.data.resultType === 'streams') {
    for (const entry of result.data.result) {
        for (const [timestamp, line] of entry.values) {
            console.log(entry.stream.app, timestamp, line);
        }
    }
}
```

Sends `GET loki/api/v1/query` with these parameters (`QuerierQueryOptions`):

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | The LogQL query. Required. |
| `limit` | `number` | Maximum number of entries. |
| `time` | `bigint \| string` | Evaluation time, nanosecond Unix epoch. |
| `direction` | `'backward' \| 'forward'` | Sort order. The `QuerierQueryDirection` enum holds both values. |

### `queryRange`

```typescript
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

const end = nanoSeconds();

const result = await client.querier.queryRange({
    query: '{app="api"}',
    start: end - 3_600_000_000_000n, // one hour earlier
    end,
    limit: 500,
    direction: 'forward',
});
```

Sends `GET loki/api/v1/query_range` with `query`, `limit` and `direction` as above, plus (`QuerierQueryRangeOptions`):

| Parameter | Type | Description |
|---|---|---|
| `start` | `number \| bigint \| string` | Start of the range, nanosecond Unix epoch. |
| `end` | `number \| bigint \| string` | End of the range, nanosecond Unix epoch. |
| `step` | `string` | Step as a duration string, for example `30s`. |
| `interval` | `number` | Only return entries at or above this interval, in seconds. |

Both methods resolve to a `QuerierQueryResult`:

- `status` is `'success'` or `'error'`; `data.resultType` is `'streams'` or `'vector'`.
- For `streams`, `data.result` is a list of `{ stream, values }`, where `values` are `[timestamp, line]` string pairs.
- For `vector`, `data.result` is a list of `{ metric, value }`, where `value` is `[number, string]`.
- Parameters you leave out are not sent, so Loki applies its own defaults.

## Compactor

`client.compactor` (`CompactorAPI`) manages deletion requests at `loki/api/v1/delete`, against `compactorURL` or the client's `baseURL`.

### `createDeletionRequest`

```typescript
import { createClient, nanoSeconds } from '@hapic/loki';

const client = createClient();

await client.compactor.createDeletionRequest({
    query: '{app="api"}',
    start: nanoSeconds() - 86_400_000_000_000n, // 24 hours earlier
});
```

- Sends `POST loki/api/v1/delete` with `query` (LogQL, required), `start` (required) and `end` (optional) as **query string parameters**, and an empty JSON body (`{}`) with `content-type: application/json`.
- `start` and `end` are nanosecond Unix epochs as `number`, `bigint` or `string`.
- Resolves to `undefined`; the response body is not returned.

### `cancelDeletionRequest`

```typescript
import { createClient } from '@hapic/loki';

const client = createClient();

await client.compactor.cancelDeletionRequest({
    request_id: 'd7a2b0c1',
    force: true,
});
```

- Sends `DELETE loki/api/v1/delete` with `request_id` and, when set, `force` as query string parameters, and no body.
- `request_id` is a `string`, `number` or `bigint`. With `force: true`, a partially completed request is cancelled as well.
- Resolves to `undefined`.

## Timestamps

```typescript
import { nanoSeconds } from '@hapic/loki';

const now: bigint = nanoSeconds();
const fiveMinutesAgo = now - 300_000_000_000n;
```

- `nanoSeconds()` returns the current time as a `bigint` of nanoseconds since the Unix epoch, computed from `performance.timeOrigin` plus `performance.now()`.
- Pass timestamps as `bigint` or `string`. A nanosecond epoch (about `1.8e18`) is larger than `Number.MAX_SAFE_INTEGER`, so a `number` loses precision even where the type allows one (`start`, `end`).

## Client registry

```typescript
import { createClient, setClient, useClient } from '@hapic/loki';

setClient(createClient({ request: { baseURL: 'https://loki.example.com/' } }));

// anywhere else
const client = useClient();
```

| Function | Behaviour |
|---|---|
| `createClient(config?)` | Returns a new `LokiClient`. Does not register it. |
| `useClient(key?)` | Returns the client registered under `key` (default `'default'`); on first use it creates and registers a `LokiClient` with default config. |
| `setClient(client, key?)` | Registers `client` under `key` and returns it. |
| `hasClient(key?)` | Whether a client is registered under `key`. |
| `unsetClient(key?)` | Removes the client registered under `key`. |
| `isClient(value)` | `true` for a `LokiClient`, also one created by another copy of the package; `false` for a plain `hapic` client. |

The default export is a `LokiClient` with default config, created when the module loads. It is **not** the registry's `'default'` client: `useClient()` returns a different instance. More in [Instance Registry](https://hapic.tada5hi.net/guide/instance).

## Errors

```typescript
import {
    createClient,
    isClientErrorWithStatusCode,
    isHttpResponseError,
    isNetworkError,
} from '@hapic/loki';

const client = createClient();

try {
    await client.querier.query({ query: '{app="api"' });
} catch (error) {
    if (isClientErrorWithStatusCode(error, 400)) {
        // Loki rejected the query
    }

    if (isHttpResponseError(error)) {
        console.error(error.status, error.response?.data);
    } else if (isNetworkError(error)) {
        console.error(error.code); // for example 'ETIMEDOUT', 'ECONNABORTED' or 'ECONNRESET'
    }
}
```

- A 4xx or 5xx response rejects with an `HttpResponseError`: `status` holds the status code, `response.data` the decoded body.
- A request that gets no response (connection failure, abort, `timeout`) rejects with a `NetworkError`, whose `code` names the cause.
- Both are `ClientError`s, and every error thrown is a `HapicError`. The guards `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode` and `isClientErrorDueNetworkIssue` are re-exported from `hapic`, and they also recognise errors thrown by another copy of the package.
- Error hooks registered with `client.on(...)` can retry a failed request or answer it with a fallback response. See [Error Handling](https://hapic.tada5hi.net/guide/errors) and [Hooks](https://hapic.tada5hi.net/guide/hooks).

## API

| Export | Kind | Purpose |
|---|---|---|
| `LokiClient` | class | `hapic` client with `distributor`, `querier` and `compactor`. |
| `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` | functions | [Client registry](#client-registry). |
| default export | `LokiClient` | A client with default config, created on import. |
| `DistributorAPI` | class | [`push`](#push), [`pushMany`](#pushmany). |
| `QuerierAPI` | class | [`query`](#query), [`queryRange`](#queryrange). |
| `CompactorAPI` | class | [`createDeletionRequest`](#createdeletionrequest), [`cancelDeletionRequest`](#canceldeletionrequest). |
| `QuerierQueryDirection` | enum | `BACKWARD = 'backward'`, `FORWARD = 'forward'`. |
| `nanoSeconds` | function | Current time as a nanosecond `bigint`, see [Timestamps](#timestamps). |
| `LOKI_CLIENT_INSTANCE` | symbol | The marker `isClient` checks for. |
| `HeaderName` | enum | `CONTENT_TYPE = 'Content-Type'`. |
| `Config`, `ConfigInput`, `Options` | types | Client configuration. |
| `DistributorPushStream` | type | A stream for `push` and `pushMany`. |
| `QuerierQueryOptions`, `QuerierQueryRangeOptions` | types | Parameters of `query` and `queryRange`. |
| `QuerierQueryResult`, `QuerierQueryStreamsResult`, `QuerierQueryVectorResult` | types | Query results. |
| `CompactorDeletionRequestCreate`, `CompactorDeletionRequestCancel` | types | Parameters of the compactor methods. |
| `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue` | functions | Error guards, re-exported from `hapic`. |
| `HapicError`, `ClientError`, `HttpResponseError`, `NetworkError`, `ErrorCode`, `RequestBaseOptions`, `Response`, `ResponseData` | types | Re-exported from `hapic` as types only. Import `ErrorCode` from `hapic` to use its values. |

## Notes

- **Write methods do not return the response.** `push`, `pushMany`, `createDeletionRequest` and `cancelDeletionRequest` resolve to `undefined` on a 2xx. Register a `response` hook if you need the raw response.
- **Each domain object talks to one component.** Distributor methods use `distributorURL`, querier methods `querierURL`, compactor methods `compactorURL`, each falling back to the client's `baseURL`. The four other option keys are not used by any method.
- **`setOptions` detaches a domain object.** It replaces that domain object's options object. Use `setOption`, or change your own `options` object, to change a URL for all of them.
- **`connectionString` is ignored.** The `Config` type has a `connectionString` key, but `LokiClient` does not read it. Set `request.baseURL` and the authorization header instead.
- **Client-wide `params` do not reach the querier and compactor.** A per-request `params` replaces the client default as a whole, and these methods pass their own. A client-wide `query` object is still merged into every query string.
- **The default export and `useClient()` are two clients.** Configure the one you use.
- **Query results are typed for `streams` and `vector` only.** The body is returned as Loki sends it; any other `resultType` arrives with a type that does not describe it.
- **Deletion parameters go into the query string**, not into the JSON body, which is always `{}`.
- **Timestamps as `number` lose precision.** Use `bigint` or `string`, for example from `nanoSeconds()`.

## Contributing

Issues and pull requests are welcome in the [hapic repository](https://github.com/tada5hi/hapic). Commits follow [Conventional Commits](https://www.conventionalcommits.org/), which drive the changelog and the releases.

## License

Made with 💚

Published under [MIT License](./LICENSE).
