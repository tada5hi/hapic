<p align="center">
    <img src="./assets/logo.svg" alt="@hapic/victorialogs logo" width="120" />
</p>

<h1 align="center">@hapic/victorialogs</h1>

<p align="center">
    <b>Typed HTTP client for VictoriaLogs: ingest JSON log entries and run LogsQL queries.</b><br>
    You stop splitting newline-delimited JSON responses and encoding query strings by hand,<br>
    and you point ingestion and querying at their own base URLs from one options object.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hapic/victorialogs"><img src="https://img.shields.io/npm/v/@hapic/victorialogs" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net/packages/victorialogs"><b>Documentation</b></a>
    ·
    <a href="#why-hapicvictorialogs">Why</a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#configuration">Configuration</a>
    ·
    <a href="#ingestor">Ingestor</a>
    ·
    <a href="#querier">Querier</a>
    ·
    <a href="#errors">Errors</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why @hapic/victorialogs?

The VictoriaLogs query endpoint answers with newline-delimited JSON: one log entry per line, not one JSON document. With plain `fetch` you read the body as text, split it into lines, skip the blank ones and parse each line, after encoding the LogsQL query into the URL and checking `response.ok`. When ingestion and querying are served from different URLs, you keep track of both.

| Concern | Without it (`fetch`) | With `@hapic/victorialogs` |
|---|---|---|
| **Newline-delimited JSON** | `await response.text()`, split on `\n` and `\r\n`, drop blank lines, `JSON.parse` every line. | `querier.query()` returns an array of entries; an empty body gives `[]`. |
| **LogsQL in the query string** | You URL-encode the query, `limit`, `start`, `end` and the other parameters. | Query parameters are a typed object; the client encodes them. |
| **Ingestion** | You `POST` JSON to `/insert/jsonline` and set the `content-type` header. | `ingestor.insert(entry)` sends the entry with the header. |
| **Separate ingest and query URLs** | You keep two base URLs around. | One `options` object with `ingesterURL` and `querierURL`; each falls back to the client's `baseURL`. |
| **Error statuses** | `fetch` resolves on a 4xx or 5xx; you check `response.ok`. | A 4xx or 5xx rejects with an `HttpResponseError` that carries the status and the response body. |
| **Entry shape** | Every parsed line is `any`. | `QuerierQueryResultItem` with `_msg`, `_time`, `_stream` and `_stream_id`. |

The same query, two ways:

```typescript
// fetch
const url = new URL('select/logsql/query', 'http://localhost:9428/');
url.searchParams.set('query', 'error');
url.searchParams.set('limit', '10');

const response = await fetch(url);
if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
}

const entries = (await response.text())
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
```

```typescript
// @hapic/victorialogs
import { createClient } from '@hapic/victorialogs';

const client = createClient();

const entries = await client.querier.query({ query: 'error', limit: 10 });
```

## Installation

```bash
npm install hapic @hapic/victorialogs --save
```

- ESM only (`import`, no `require`).
- Node.js `>=22.0.0`. The client is built on `fetch`, so it also runs in browsers and workers.
- `hapic` is a peer dependency: `VictoriaLogsClient` extends its `Client`, so install both.

## Configuration

```typescript
import { createClient } from '@hapic/victorialogs';

const client = createClient({
    request: {
        baseURL: 'https://logs.example.com/',
        timeout: 10_000,
    },
    options: {
        ingesterURL: 'https://logs-insert.example.com/',
    },
});

client.setAuthorizationHeader({ type: 'Bearer', token: 'secret' });
```

`createClient(config)` and `new VictoriaLogsClient(config)` take the same object:

| Key | Type | Description |
|---|---|---|
| `request` | `ClientOptionsInput` from `hapic` | Options of the underlying `hapic` client: `baseURL`, `headers`, `timeout` (milliseconds), `proxy`, `transport` and every `fetch` `RequestInit` option. `baseURL` defaults to `http://localhost:9428/`. The object you pass is copied, not modified. All options: [The Client](https://hapic.tada5hi.net/guide/client). |
| `options` | `Options` | Per-component base URLs, see [Component base URLs](#component-base-urls). |

Headers in `request.headers`, or set later with `client.setHeader()`, go with every request. The inherited `client.setAuthorizationHeader()` sets the `Authorization` header in `Basic`, `Bearer` or API-key form.

### Component base URLs

When ingestion and querying are served from different URLs, each domain object can send its requests to its own base URL:

```typescript
import { createClient } from '@hapic/victorialogs';
import type { Options } from '@hapic/victorialogs';

const options: Options = {
    querierURL: 'http://logs-select:9428/',
};

const client = createClient({
    request: { baseURL: 'http://logs:9428/' },
    options,
});

// writes into the shared object: options.ingesterURL is set now as well
client.querier.setOption('ingesterURL', 'http://logs-insert:9428/');
```

| Option | Used by | Methods |
|---|---|---|
| `ingesterURL` | `client.ingestor` | `insert` |
| `querierURL` | `client.querier` | `query` |

- A request uses the option of its component when it is set and not empty, and the client's `baseURL` otherwise. A path in the base URL is kept: with `https://host/logs/`, `insert` posts to `https://host/logs/insert/jsonline`.
- The option is spelled `ingesterURL`, the domain object `ingestor`.
- Both domain objects share **one options object**: the object you pass as `options`, or a new empty object when you pass none. They keep a reference, not a copy, so when you change your object, the next request goes to the new URL.
- `setOption(key, value)` on either domain object writes `key` into that shared object, so both see it.
- `setOptions(options)` replaces the options object of **that one domain object** (with an empty object when called without an argument). From then on it no longer shares options with the other, and a later `setOption` on the other does not reach it.
- Options are read when a request is built, so a change applies from the next request on.

### Using a domain object on its own

```typescript
import { QuerierAPI } from '@hapic/victorialogs';

const querier = new QuerierAPI({
    client: { baseURL: 'http://logs-select:9428/' },
});
```

Every domain class takes `{ client, options }`. `client` is either an existing client (a `VictoriaLogsClient` or any `hapic` client) or request options. With request options, or without `client`, the domain object creates a plain `hapic` client, which has no default base URL: the `http://localhost:9428/` default belongs to `VictoriaLogsClient`.

## Ingestor

`client.ingestor` (`IngestorAPI`) writes log entries with `POST /insert/jsonline`, against `ingesterURL` or the client's `baseURL`.

### `insert`

```typescript
import { createClient } from '@hapic/victorialogs';

const client = createClient();

await client.ingestor.insert({
    _msg: 'user logged in',
    _time: new Date().toISOString(),
    service: 'user-api',
    level: 'info',
});
```

- `insert(entry)` sends **one** entry per request. The entry (`IngestorData`) needs `_msg` (string); `_time` and `_stream` are optional strings, and any other fields are sent as they are.
- The body is the entry as JSON, sent with `content-type: application/json`. The client adds no query string parameters.
- Resolves to `undefined` once VictoriaLogs answers with a 2xx.

## Querier

`client.querier` (`QuerierAPI`) runs LogsQL queries against `querierURL` or the client's `baseURL`.

### `query`

```typescript
import { createClient } from '@hapic/victorialogs';

const client = createClient();

const entries = await client.querier.query({
    query: 'service:user-api AND level:error',
    start: '2026-01-07T09:00:00Z',
    end: '2026-01-07T10:00:00Z',
    limit: 100,
});

for (const entry of entries) {
    console.log(entry._time, entry._msg);
}
```

Sends `GET select/logsql/query` with `accept: application/json` and these query string parameters (`QuerierQueryOptions`):

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | The LogsQL query. Required. |
| `limit` | `number` | Maximum number of entries. |
| `offset` | `number` | Number of entries to skip. |
| `start` | `string` | Start of the time range. |
| `end` | `string` | End of the time range. |
| `timeout` | `string` | Query timeout as a duration string such as `5s`, passed to VictoriaLogs. This is not the client's `timeout` option. |

How the response becomes the result:

- The body is read as text in full, split on `\n` or `\r\n`, lines that are empty or only whitespace are skipped, and every other line goes through `JSON.parse`.
- Resolves to an array with one object per line, in the order of the response (`QuerierQueryResult`). An empty body gives `[]`.
- Each item is typed as `QuerierQueryResultItem`: `_msg`, `_time`, `_stream` and `_stream_id`, plus any other string fields. The client does not check that these fields are present; it returns each line as parsed.

## Client registry

```typescript
import { createClient, setClient, useClient } from '@hapic/victorialogs';

setClient(createClient({ request: { baseURL: 'https://logs.example.com/' } }));

// anywhere else
const client = useClient();
```

| Function | Behaviour |
|---|---|
| `createClient(config?)` | Returns a new `VictoriaLogsClient`. Does not register it. |
| `useClient(key?)` | Returns the client registered under `key` (default `'default'`); on first use it creates and registers a `VictoriaLogsClient` with default config. |
| `setClient(client, key?)` | Registers `client` under `key` and returns it. |
| `hasClient(key?)` | Whether a client is registered under `key`. |
| `unsetClient(key?)` | Removes the client registered under `key`. |
| `isClient(value)` | `true` for a `VictoriaLogsClient`, also one created by another copy of the package; `false` for a plain `hapic` client. |

The default export is a `VictoriaLogsClient` with default config, created when the module loads. It is **not** the registry's `'default'` client: `useClient()` returns a different instance. More in [Instance Registry](https://hapic.tada5hi.net/guide/instance).

## Errors

```typescript
import {
    createClient,
    isClientErrorWithStatusCode,
    isHttpResponseError,
    isNetworkError,
} from '@hapic/victorialogs';

const client = createClient();

try {
    await client.querier.query({ query: 'level:(' });
} catch (error) {
    if (isClientErrorWithStatusCode(error, 400)) {
        // VictoriaLogs rejected the query
    }

    if (isHttpResponseError(error)) {
        console.error(error.status, error.response?.data); // the response body as text
    } else if (isNetworkError(error)) {
        console.error(error.code); // for example 'ETIMEDOUT', 'ECONNABORTED' or 'ECONNRESET'
    } else {
        throw error; // for example a SyntaxError from a line that is not JSON
    }
}
```

- A 4xx or 5xx response rejects with an `HttpResponseError`: `status` holds the status code, `response.data` the body. For `query` the body is always text.
- A request that gets no response (connection failure, abort, `timeout`) rejects with a `NetworkError`, whose `code` names the cause.
- Both are `ClientError`s, and every error the client throws is a `HapicError`. The guards `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode` and `isClientErrorDueNetworkIssue` are re-exported from `hapic`, and they also recognise errors thrown by another copy of the package.
- A line of a 2xx query response that is not valid JSON makes `query` reject with the `SyntaxError` from `JSON.parse`, which is not a `HapicError`.
- Error hooks registered with `client.on(...)` can retry a failed request or answer it with a fallback response. See [Error Handling](https://hapic.tada5hi.net/guide/errors) and [Hooks](https://hapic.tada5hi.net/guide/hooks).

## API

| Export | Kind | Purpose |
|---|---|---|
| `VictoriaLogsClient` | class | `hapic` client with `ingestor` and `querier`. |
| `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` | functions | [Client registry](#client-registry). |
| default export | `VictoriaLogsClient` | A client with default config, created on import. |
| `IngestorAPI` | class | [`insert`](#insert). |
| `QuerierAPI` | class | [`query`](#query). |
| `VICTORIALOGS_CLIENT_INSTANCE`, `CLIENT_INSTANCE_NAME` | symbol, string | The marker `isClient` checks for, and its name. |
| `HeaderName` | enum | `ACCEPT`, `CONTENT_TYPE`, `CONTENT_LENGTH` (lower-case header names). |
| `Config`, `ConfigInput`, `Options` | types | Client configuration. |
| `IngestorData` | type | An entry for `insert`. |
| `QuerierQueryOptions` | type | Parameters of `query`. |
| `QuerierQueryResult`, `QuerierQueryResultItem` | types | The parsed entries. |
| `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue` | functions | Error guards, re-exported from `hapic`. |
| `HapicError`, `ClientError`, `HttpResponseError`, `NetworkError`, `ErrorCode`, `RequestBaseOptions`, `Response`, `ResponseData` | types | Re-exported from `hapic` as types only. Import `ErrorCode` from `hapic` to use its values. |

## Notes

- **The query response is buffered in memory.** `query` reads the whole body as text before parsing it; nothing is streamed. Use `limit` (and `offset`) to keep large results in bounds.
- **An empty result is `[]`**, not an error and not `undefined`.
- **One entry per `insert` call.** Each call is one HTTP request with one JSON object; there is no batch method.
- **Each domain object talks to one component.** `insert` uses `ingesterURL`, `query` uses `querierURL`, each falling back to the client's `baseURL`.
- **`setOptions` detaches a domain object.** It replaces that domain object's options object. Use `setOption`, or change your own `options` object, to change a URL for both.
- **Two kinds of timeout.** The `timeout` query option is a duration string sent to VictoriaLogs; the client's `request.timeout` is in milliseconds and aborts the HTTP request.
- **`connectionString` is ignored.** The `Config` type has a `connectionString` key, but `VictoriaLogsClient` does not read it. Set `request.baseURL` and the authorization header instead.
- **Client-wide `params` do not reach `query`.** A per-request `params` replaces the client default as a whole, and `query` passes its own. A client-wide `query` object is still merged into every query string.
- **The default export and `useClient()` are two clients.** Configure the one you use.

## Contributing

Issues and pull requests are welcome in the [hapic repository](https://github.com/tada5hi/hapic). Commits follow [Conventional Commits](https://www.conventionalcommits.org/), which drive the changelog and the releases.

## License

Made with 💚

Published under [MIT License](./LICENSE).
