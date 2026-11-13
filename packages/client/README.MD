<p align="center">
    <img src="./assets/logo.svg" alt="hapic logo" width="120" />
</p>

<h1 align="center">hapic</h1>

<p align="center">
    <b>A fetch-based HTTP client for Node.js, browsers and workers.</b><br>
    You stop writing base URL joins, JSON encoding, status checks and timeout plumbing around <code>fetch</code>,<br>
    and you get hooks that can retry a failed request and errors that carry the decoded response.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/hapic"><img src="https://img.shields.io/npm/v/hapic" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net"><b>Documentation</b></a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#options">Options</a>
    ·
    <a href="#hooks">Hooks</a>
    ·
    <a href="#errors">Errors</a>
    ·
    <a href="#testing-with-memorytransport">Testing</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

hapic ("**H**TTP **API** **C**lient") wraps `fetch` in one `Client` class. It resolves a base URL and query parameters, encodes JSON bodies, decodes responses by type, rejects on a `4xx`/`5xx` status, and runs request, response and error hooks around every call. The same class is the base of the typed service clients in this repository ([`@hapic/harbor`](https://www.npmjs.com/package/@hapic/harbor), [`@hapic/loki`](https://www.npmjs.com/package/@hapic/loki), [`@hapic/oauth2`](https://www.npmjs.com/package/@hapic/oauth2), [`@hapic/vault`](https://www.npmjs.com/package/@hapic/vault), [`@hapic/victorialogs`](https://www.npmjs.com/package/@hapic/victorialogs)), so everything below applies to them too.

```typescript
import { createClient, isClientErrorWithStatusCode } from 'hapic';

const client = createClient({
    baseURL: 'https://api.example.com/',
    timeout: 10_000,
});

client.setAuthorizationHeader({ type: 'Bearer', token: 'my-token' });

try {
    const { data } = await client.post('users', { name: 'Peter' });
    console.log(data.id);
} catch (error) {
    if (isClientErrorWithStatusCode(error, 409)) {
        // the server answered 409; error.response.data holds its body
    }
}
```

**Table of Contents**
- [Installation](#installation)
- [How a request runs](#how-a-request-runs)
- [Creating a client](#creating-a-client)
- [Options](#options)
- [Request methods](#request-methods)
- [Headers and authorization](#headers-and-authorization)
- [Hooks](#hooks)
    - [Error hooks recover or retry](#error-hooks-recover-or-retry)
- [Transformers](#transformers)
- [Responses](#responses)
    - [Server-sent events](#server-sent-events)
- [Timeouts and abort signals](#timeouts-and-abort-signals)
- [Errors](#errors)
- [Instance registry](#instance-registry)
- [Copying a configuration](#copying-a-configuration)
- [Transports](#transports)
    - [Testing with MemoryTransport](#testing-with-memorytransport)
- [Proxy](#proxy)
- [Building a service client](#building-a-service-client)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install hapic --save
```

- **ESM only.** The package ships `dist/index.mjs` and `dist/index.d.mts`. Use `import`, or a dynamic `import()` from CommonJS. Type declarations are included.
- **Node.js `>=22.0.0`.** Browsers, workers, Deno and Bun use their platform `fetch`. Where `fetch`, `Headers`, `Blob`, `FormData` or `AbortController` are missing from the global object, hapic falls back to [`node-fetch-native`](https://www.npmjs.com/package/node-fetch-native).
- One entry point for every environment.

## How a request runs

Every method (`get`, `post`, ...) calls `request(config)`, which runs the same pipeline:

<p align="center">
    <img src="./assets/request-lifecycle.svg" alt="The hapic request lifecycle. Every call runs through Client.request. resolveRequestOptions merges the client defaults, headers and query, the request hooks may replace the options, options.transform turns the body into JSON by default, and transport.dispatch sends it. decodeResponse reads the body by responseType and runs responseTransform. A status below 400 runs the response hooks and resolves with the Response and its data. A status from 400 to 599 runs the responseError hooks with an HttpResponseError; a dispatch that fails, aborts or times out runs the requestError hooks with a NetworkError. An error hook that returns a Response resolves with it, one that returns RequestOptions runs request again from the start, and when no hook recovers the call rejects with the ClientError." width="100%" />
</p>

1. **Resolve options.** Per-request options replace the client defaults; headers are layered (request headers win, client headers fill the gaps). The URL is resolved against `baseURL`, then `params` and `query` are appended.
2. **Request hooks** run in registration order. Each may return new `RequestOptions`.
3. **Transformers** (`transform`) turn the body into what is sent. The default one encodes plain objects as JSON.
4. **Dispatch.** The body is dropped for methods other than `POST`, `PUT` and `PATCH`, and the transport (`FetchTransport` by default) sends the request. A `timeout` and a `signal` are combined into one abort signal.
5. **Decode.** The body is read by `responseType`, or by the `Content-Type` header, then passed through `responseTransform`.
6. **Status check.** A status from 400 to 599 becomes an `HttpResponseError` and runs the `responseError` hooks. A failed, aborted or timed-out dispatch becomes a `NetworkError` and runs the `requestError` hooks.
7. **Response hooks** run for every other status, then the call resolves with the `Response`.

An error hook can recover: return a `Response` to resolve with it, or `RequestOptions` to run the whole pipeline again. See [Hooks](#hooks).

## Creating a client

```typescript
import hapic, { Client, createClient } from 'hapic';

// the default export is a client created without options
await hapic.get('https://api.example.com/users');

// both lines create a new, independent client
const a = new Client({ baseURL: 'https://api.example.com/' });
const b = createClient({ baseURL: 'https://api.example.com/' });
```

The constructor options become `client.defaults`, the client's default headers and its transport. To share one configured client across modules, register it in the [instance registry](#instance-registry).

## Options

The options extend the platform [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit), so `credentials`, `mode`, `cache`, `redirect`, `signal` and the other `fetch` options are passed through. Every option can be set on the client and per request, except `transport`.

```typescript
import { createClient } from 'hapic';

const client = createClient({
    baseURL: 'https://api.example.com/',
    headers: { 'x-tenant': 'acme' },
    credentials: 'include',
    query: { locale: 'en' },
    timeout: 10_000,
    proxy: { url: 'http://localhost:9080', noProxy: '.internal.example' },
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `baseURL` | `string` | none | Resolved in front of each request URL. A request URL that is already absolute is kept as it is. |
| `headers` | `HeadersInit` | none | Default headers. Per-request headers are layered over them. |
| `params` / `query` | `Record<string, any>` | none | Appended to the URL as a query string. Both are merged (`query` wins on a shared key); `bigint` values become strings. |
| `body` | `BodyInit \| Record<string, any>` | none | The request body. `post`, `put` and `patch` take it as an argument; it is dropped for other methods. |
| `transform` | `RequestTransformer \| RequestTransformer[]` | the JSON transformer | `(data, headers) => body`, run after the request hooks. Setting it replaces the default. See [Transformers](#transformers). |
| `responseType` | `'json' \| 'text' \| 'blob' \| 'arrayBuffer' \| 'stream'` | from `Content-Type` | How the body is read. See [Responses](#responses). |
| `responseTransform` | `ResponseTransformer \| ResponseTransformer[]` | none | `(data, headers, status) => data`, run on the decoded body, also for `4xx`/`5xx`. Not run for streams. |
| `timeout` | `number` | none | Abort after this many milliseconds, reading the body included. See [Timeouts and abort signals](#timeouts-and-abort-signals). |
| `signal` | `AbortSignal` | none | Abort the request yourself. Combined with `timeout`. |
| `proxy` | `ProxyOptions \| boolean` | `true` | `true` reads the proxy environment variables, `false` turns proxying off, an object sets `url` and `noProxy`. Node.js only. See [Proxy](#proxy). |
| `transport` | `ITransport` | `new FetchTransport()` | Constructor only. What sends the request. See [Transports](#transports). |

How client defaults and per-request options combine:

- A per-request option **replaces** the client default as a whole, `transform`, `responseTransform`, `params` and `query` included.
- `headers` are **layered**: per-request headers win, client headers fill in the names the request does not set.
- A per-request `timeout` or `signal` of `undefined` keeps the client default.

## Request methods

```typescript
import { createClient } from 'hapic';

type User = { id: number, name: string };

const client = createClient({ baseURL: 'https://api.example.com/' });

const { data: users } = await client.get<User[]>('users', { query: { page: 2 } });
const { data: created } = await client.post<User>('users', { name: 'Hans' });

await client.put('users/3', { id: 3, name: 'Hans' });
await client.patch('users/3', { name: 'Hans P.' });
await client.delete('users/3');

const head = await client.head('users/3');
console.log(head.status, head.headers.get('etag'));
```

| Method | Signature | Body |
|---|---|---|
| `get` | `get(url, config?)` | dropped |
| `delete` | `delete(url, config?)` | dropped |
| `head` | `head(url, config?)` | dropped |
| `post` | `post(url, body?, config?)` | sent |
| `put` | `put(url, body?, config?)` | sent |
| `patch` | `patch(url, body?, config?)` | sent |
| `request` | `request({ url, method, ...config })` | sent for `POST`, `PUT` and `PATCH` |

- Each resolves with a [`Response`](#responses) whose `data` holds the decoded body, and rejects for a status from 400 to 599.
- The first type argument types `data` for JSON. With `responseType` set to `'text'`, `'blob'`, `'arrayBuffer'` or `'stream'`, `data` is typed `string`, `Blob`, `ArrayBuffer` or `ReadableStream`.
- `config` takes the same [options](#options) as the constructor, for this call only.

Call `request` for full control, with a method from the `MethodName` enum or a plain string:

```typescript
import { MethodName, createClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

const { data } = await client.request({
    method: MethodName.POST,
    url: 'users',
    body: { name: 'Peter' },
    query: { dryRun: true },
});
```

## Headers and authorization

```typescript
import { createClient } from 'hapic';

const client = createClient({
    baseURL: 'https://api.example.com/',
    headers: { accept: 'application/json' },
});

client
    .setHeader('x-tenant', 'acme')
    .setAuthorizationHeader({ type: 'Bearer', token: 'my-token' });

client.getHeader('x-tenant');      // 'acme'
client.getAuthorizationHeader();   // 'Bearer my-token'

client.unsetHeader('x-tenant');
client.unsetAuthorizationHeader();
client.unsetHeaders();             // remove every default header

// a per-request header overrides the default for one call
await client.get('report.csv', { headers: { accept: 'text/csv' } });
```

- Header names are case-insensitive; the client keeps its default headers in a `Headers` object. The setters return the client, so they chain.
- `setAuthorizationHeader` takes a typed descriptor (`AuthorizationHeader`) and sets the `authorization` header for every upcoming request:

| `type` | Fields | Header value |
|---|---|---|
| `'Bearer'` | `token` | `Bearer <token>` |
| `'Basic'` | `username`, `password` | `Basic <base64 of username:password>` |
| `'API-Key'` / `'X-API-Key'` | `key` | `API-Key <key>` / `X-API-Key <key>` |

- `stringifyAuthorizationHeader(descriptor)` and `parseAuthorizationHeader(value)` convert between the descriptor and the header string. Parsing throws an `AuthorizationHeaderError` for an unknown scheme or a malformed value.
- `HeaderName` holds the names hapic itself uses: `HeaderName.ACCEPT`, `HeaderName.AUTHORIZATION` and `HeaderName.CONTENT_TYPE`.
- To compute a header per request (a token that changes, a request id), set it in a [request hook](#hooks).

## Hooks

```typescript
import { Headers, createClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

const id = client.on('request', (options) => {
    const headers = new Headers(options.headers);
    headers.set('x-request-id', crypto.randomUUID());

    return { ...options, headers };
});

client.on('response', (response) => {
    console.debug(response.status, response.url);

    return response;
});

client.off('request', id);   // remove this hook
client.off('response');      // remove every response hook
```

| Hook | `HookName` | Runs when | Receives | Return value |
|---|---|---|---|---|
| `request` | `REQUEST` | before the transformers and the dispatch | `RequestOptions` | `RequestOptions` replace the options; anything else keeps them |
| `response` | `RESPONSE` | the status is below 400 | `Response` | a `Response` replaces it; anything else keeps it |
| `requestError` | `REQUEST_ERROR` | the dispatch failed, was aborted or timed out, so there is no response | `NetworkError` | a `Response` resolves the call; `RequestOptions` retry it |
| `responseError` | `RESPONSE_ERROR` | the status is from 400 to 599 | `HttpResponseError` | a `Response` resolves the call; `RequestOptions` retry it |

- Hooks of one name run in registration order and may be `async`. Each request and response hook receives what the previous one returned.
- `on(name, fn)` returns an id. `off(name, id)` or `off(name, fn)` removes one hook; `off(name)` removes every hook of that name.
- In a request hook, `options.headers` is a `Headers` object. Copy it with `new Headers(options.headers)` as above: spreading it (`{ ...options.headers }`) gives an empty object, loses every header and makes the default transformer throw.

### Error hooks recover or retry

Error hooks run in registration order, each receiving the `ClientError`. The first hook that returns a `Response` or `RequestOptions` decides the outcome, and the remaining hooks are skipped. A hook that throws hands its error to the next hook. When no hook recovers, the call rejects with the last error.

| The error hook | Result |
|---|---|
| returns a `Response` | the call resolves with that response |
| returns `RequestOptions` | the request runs again through the whole pipeline, hooks included |
| returns nothing, or throws | the next hook runs; after the last one the call rejects |

Refresh an expired token and retry. A `401` is a response, so the hook is `responseError`, not `requestError`:

```typescript
import { Headers, createClient, isClientErrorWithStatusCode } from 'hapic';

declare function refreshAccessToken(): Promise<string>;

const client = createClient({ baseURL: 'https://api.example.com/' });

client.on('responseError', async (error) => {
    const headers = new Headers(error.request.headers);

    if (isClientErrorWithStatusCode(error, 401) && !headers.has('x-token-refreshed')) {
        const token = await refreshAccessToken();
        client.setAuthorizationHeader({ type: 'Bearer', token });

        headers.set('authorization', `Bearer ${token}`);
        headers.set('x-token-refreshed', '1');

        return { ...error.request, headers };
    }

    throw error;
});
```

- `error.request` holds the options as they were dispatched: the URL with the base URL and query applied, the merged headers and the transformed body. Returning it, changed or not, runs the request again.
- A retried request passes through this hook again. hapic sets no retry limit, so guard against loops: here the marker header stops a second refresh.

Answer a network failure with a fallback response instead of rejecting:

```typescript
import { createClient, isClientErrorDueNetworkIssue } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

client.on('requestError', (error) => {
    if (isClientErrorDueNetworkIssue(error)) {
        return new Response(JSON.stringify({ offline: true }), {
            headers: { 'content-type': 'application/json' },
        });
    }

    throw error;
});
```

A `Response` returned by an error hook is used as it is: it is not decoded, so its `data` is not set. Read it with `response.json()` or set `data` in the hook.

## Transformers

A request transformer receives the body and the request `Headers` and returns the body to send. Set it on the client or per request:

```typescript
import { createClient, createDefaultRequestTransformer } from 'hapic';
import type { RequestTransformer } from 'hapic';

const toForm: RequestTransformer = (data, headers) => {
    headers.set('content-type', 'application/x-www-form-urlencoded');

    return new URLSearchParams(data).toString();
};

const client = createClient({ baseURL: 'https://api.example.com/' });

await client.post('login', { username: 'admin', password: 'secret' }, { transform: toForm });
// body: username=admin&password=secret

// an array runs in order; add the default one to keep JSON encoding
const stamped = createClient({
    transform: [
        (data) => ({ ...data, sentAt: Date.now() }),
        createDefaultRequestTransformer(),
    ],
});
```

The default transformer (`createDefaultRequestTransformer()`) does this:

| Body | Sent as | Headers |
|---|---|---|
| `FormData` | as it is | removes `content-type`, so `fetch` sets the multipart boundary |
| `Blob`, `File`, `ArrayBuffer`, a Node.js stream (has `pipe()`) | as it is | none |
| `URLSearchParams` | as it is | `content-type: application/x-www-form-urlencoded;charset=utf-8` |
| a string | as it is | `content-type` and `accept` set to `application/json` when absent |
| any other object, array, number, boolean or `bigint` | `JSON.stringify`, `bigint` as a string | `content-type` and `accept` set to `application/json` when absent |

Setting `transform` replaces this default, on the client or for one request. Typed arrays, Node.js `Buffer`s and web `ReadableStream`s count as "any other object" and are JSON-encoded: send binary data as a `Blob` or `ArrayBuffer`.

A response transformer receives the decoded `data`, the response headers and the status, and returns the new `data`:

```typescript
import { createClient } from 'hapic';

const client = createClient({
    responseTransform: (data, headers, status) => {
        if (status >= 400) {
            return data?.error ?? data;
        }

        // unwrap the { result } envelope of JSON responses
        if (headers.get('content-type')?.includes('json')) {
            return data?.result ?? data;
        }

        return data;
    },
});
```

- It runs once per response on the decoded body, for `4xx`/`5xx` bodies too, so `error.response.data` is transformed as well.
- It is skipped when the body is a stream (`responseType: 'stream'`, a detected `text/event-stream`, or a response without `Content-Type`).
- An array runs in order, each function receiving the previous output. A per-request `responseTransform` replaces the client one.
- If it throws on a `4xx`/`5xx` body, the body is left untransformed and the usual `HttpResponseError` is thrown, so error hooks keep working. If it throws on a successful response, the call rejects with that error as it is (not a `ClientError`).

## Responses

A call resolves with the platform `Response`, plus a `data` property holding the decoded body:

```typescript
import { ResponseType, createClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

const response = await client.get('users/1');
response.status;               // 200
response.headers.get('etag');  // a Headers object
response.data;                 // the decoded body

const { data: archive } = await client.get('archive.zip', {
    responseType: ResponseType.BLOB,
});
```

| `responseType` | `data` | Chosen when `responseType` is not set and `Content-Type` is |
|---|---|---|
| `json` | the parsed value, or the raw text if `JSON.parse` fails | `application/json`, `application/*+json`, and every type not listed in the other rows |
| `text` | `string` | `text/*`, `application/xml`, `application/xhtml`, `application/html` |
| `stream` | `ReadableStream` (the unread `response.body`, `null` without a body) | `text/event-stream`, or no `Content-Type` at all |
| `blob` | `Blob` | never detected; set it yourself |
| `arrayBuffer` | `ArrayBuffer` | never detected; set it yourself |

- Binary types such as `application/octet-stream` or `image/png` fall into the `json` row and are read as text. Set `responseType: 'blob'` or `'arrayBuffer'` for downloads.
- `data` is a getter; assigning `response.data` replaces the value.
- For `stream`, hapic does not read the body. Read it yourself, for example with `response.data.getReader()`.

### Server-sent events

A `text/event-stream` response is detected as a stream, because it stays open. Pass the response (or its body) to `parseEventStream()`:

```typescript
import { createClient, parseEventStream } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

const response = await client.get('events');

for await (const message of parseEventStream(response)) {
    console.log(message.type, message.data, message.lastEventId);
}
```

| Property | Description |
|---|---|
| `type` | the `event` field, `'message'` when absent |
| `data` | the `data` fields, joined with a line feed |
| `lastEventId` | the last `id` seen on the stream, `''` when none |
| `retry` | the last valid `retry` field seen on the stream, in milliseconds; absent until one arrives |

- Comments (`: ping`) are skipped. An event without its closing blank line when the stream ends is discarded.
- `parseEventStream()` reads one response and does not reconnect.
- For a stream that is already decoded to text, pipe it through `new EventStreamParserStream()`.

## Timeouts and abort signals

```typescript
import { createClient, isClientErrorDueTimeout } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/', timeout: 10_000 });
const controller = new AbortController();

try {
    await client.get('slow', { timeout: 2_000, signal: controller.signal });
} catch (error) {
    if (isClientErrorDueTimeout(error)) {
        // no complete response within 2 seconds
    }
}
```

- `timeout` is in milliseconds. Only a finite number above `0` arms it; `0`, a negative number or `NaN` mean no timeout. A fraction is rounded up, a value above `2147483647` (about 24.8 days) is capped.
- Each dispatch arms a fresh timer, a retry from an error hook included.
- The timeout covers reading the body. For `responseType: 'stream'` the timer keeps running while you consume the stream.
- `timeout` and `signal` are combined; whichever fires first aborts the request. A `signal` that is already aborted rejects before anything is sent.
- The rejection is a `NetworkError` that runs the `requestError` hooks:

| Cause | `error.code` | `isClientErrorDueTimeout` | `isClientErrorDueNetworkIssue` |
|---|---|---|---|
| `timeout` elapsed | `'ETIMEDOUT'` | `true` | `true` |
| `signal` aborted with a `TimeoutError` (`AbortSignal.timeout()`) | `'ETIMEDOUT'` | `true` | `true` |
| `signal` aborted for any other reason | `'ECONNABORTED'` | `false` | `false` |

## Errors

Everything hapic throws descends from `HapicError`:

```text
BaseError (@ebec/core)
 └─ HapicError                     isHapicError()
     ├─ ClientError                isClientError()
     │   ├─ NetworkError           isNetworkError()       no response
     │   └─ HttpResponseError      isHttpResponseError()  status 400 to 599
     ├─ AuthorizationHeaderError   isAuthorizationHeaderError()
     └─ ConnectionStringParseError isConnectionStringParseError()
```

```typescript
import {
    createClient,
    isClientErrorDueNetworkIssue,
    isClientErrorWithStatusCode,
    isHttpResponseError,
} from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

try {
    await client.get('users/1');
} catch (error) {
    if (isClientErrorWithStatusCode(error, [401, 403])) {
        // not allowed
    } else if (isHttpResponseError(error)) {
        console.error(error.status, error.response?.data);
    } else if (isClientErrorDueNetworkIssue(error)) {
        // never reached the server
    } else {
        throw error;
    }
}
```

A `ClientError` carries:

| Property | Description |
|---|---|
| `request` | the `RequestOptions` that were dispatched |
| `response` | the decoded `Response`; `undefined` for a `NetworkError` |
| `status` / `statusCode` | `response.status` |
| `statusText` / `statusMessage` | `response.statusText` |
| `code` | `'HTTP_RESPONSE_ERROR'` for an `HttpResponseError`; for a `NetworkError` an `ErrorCode`: `'ECONNRESET'` (dispatch failed), `'ECONNABORTED'` (aborted) or `'ETIMEDOUT'` (timed out) |
| `cause` | the underlying error of a `NetworkError` |
| `message` | for example `404 Not Found (GET https://api.example.com/users/1)` |

| Guard | True for |
|---|---|
| `isHapicError(e)` | anything thrown by `hapic` or a `@hapic/*` package |
| `isClientError(e)` | a `NetworkError` or an `HttpResponseError` |
| `isNetworkError(e)` / `isHttpResponseError(e)` | that subclass |
| `isClientErrorWithStatusCode(e, code \| code[])` | a `ClientError` whose response has one of the statuses |
| `isClientErrorDueNetworkIssue(e)` | no response and a code other than `'ECONNABORTED'` |
| `isClientErrorDueTimeout(e)` | no response and the code `'ETIMEDOUT'` |
| `isAuthorizationHeaderError(e)` / `isConnectionStringParseError(e)` | that class |

- Prefer the guards over `instanceof`: they check a marker chain that each class adds in its constructor, so they also match errors from a second copy of hapic in the bundle.
- The guards also match the plain object `error.toJSON()` produces, after it was sent as JSON and parsed again.
- `ErrorCode` also names the codes of `AuthorizationHeaderError` (`'auth_header_invalid'`, `'auth_header_parse'`, `'auth_header_type_parse'`) and `ConnectionStringParseError` (`'connection_string_invalid'`).

## Instance registry

```typescript
import { createClient, setClient, useClient } from 'hapic';

// at startup
setClient(createClient({ baseURL: 'https://api.example.com/' }));
setClient(createClient({ baseURL: 'https://auth.example.com/' }), 'auth');

// anywhere else
const { data } = await useClient().get('users');
await useClient('auth').post('login', { username: 'admin', password: 'secret' });
```

| Function | Description |
|---|---|
| `createClient(options?)` | creates a new client; does not register it |
| `setClient(client, key?)` | registers `client` under `key` (default `'default'`) and returns it |
| `useClient(key?)` | returns the client under `key`; creates and registers a client without options on first use |
| `hasClient(key?)` | whether a client is registered under `key` |
| `unsetClient(key?)` | removes the client under `key` |
| `isClient(input)` | whether `input` is a hapic client, including a service client or one from a second copy of hapic |

- The default export is not in the registry: `useClient()` returns a different client unless you `setClient(hapic)`.
- Each `@hapic/*` package exports the same six functions for its own client type. `createClientRegistry({ create, id })` builds them for your own client.

## Copying a configuration

`toOptions()` returns the client's configuration as constructor options: the defaults, the current headers and the transport.

```typescript
import { Client, createClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });
client.setHeader('x-tenant', 'acme');

const staging = new Client(client.toOptions());
staging.setBaseURL('https://staging.example.com/');
```

- Headers set or removed after construction are included.
- Arrays and plain objects among the options (`transform`, `responseTransform`, `params`, `query`, a `proxy` object) are copied one level deep, so changing one client does not change the other. Functions, a `signal` and the transport are the same instances.
- Hooks are not included; register them on the new client.

## Transports

The transport is the one place a request leaves the client. It receives the finished request (URL, method, merged headers, transformed body, signal, `proxy`) and returns the raw `Response` with its body unread. It must reject on a network failure and must not reject for a `4xx`/`5xx` status: the pipeline does that.

```typescript
import { Client, FetchTransport } from 'hapic';

const client = new Client({
    baseURL: 'https://api.example.com/',
    transport: new FetchTransport({
        fetch: (url, init) => {
            console.debug(init?.method, url);

            return fetch(url, init);
        },
    }),
});
```

- `FetchTransport` is the default. Its `fetch` option replaces the `fetch` it calls, for example one that adds an undici `dispatcher` for mutual TLS, a CA bundle or connection pooling.
- Any object with a `dispatch(request)` method that returns a `Promise<Response>` is a transport (`ITransport`). The constructor throws a `TypeError` for anything else.
- Retries, logging and caching belong in [hooks](#hooks), which run for every transport.

### Testing with MemoryTransport

`MemoryTransport` answers requests in memory and records them, while the real pipeline (header merge, URL building, transformers, hooks, decoding, errors) runs unchanged:

```typescript
import { MemoryTransport, createClient, isHttpResponseError } from 'hapic';

const transport = new MemoryTransport({
    fetch: (request) => {
        if (request.url.endsWith('/users/1')) {
            return { status: 200, body: { id: 1, name: 'Ada' } };
        }

        return { status: 404, body: { message: 'not found' } };
    },
});

const client = createClient({ baseURL: 'https://api.test/', transport });

const { data } = await client.get('users/1');
expect(data).toEqual({ id: 1, name: 'Ada' });
expect(transport.requests.at(-1)?.method).toBe('GET');

await expect(client.get('users/2')).rejects.toSatisfy(isHttpResponseError);

transport.reset();
```

| Member | Description |
|---|---|
| `new MemoryTransport({ fetch? })` | `fetch(request)` answers each dispatch with `{ status?, statusText?, headers?, body? }` or a `Response`. A plain object or array `body` is JSON-encoded, with a JSON `content-type` unless one is set. Throw or reject to take the `requestError` path. Without `fetch`, every request gets an empty `200`. |
| `requests` | every dispatched request, in order |
| `reset()` | clears `requests`; keeps the `fetch` handler |

The same works for service clients and single domain APIs: pass `transport` in the client's request options, or a client built with it to the API.

## Proxy

```typescript
import { createClient } from 'hapic';

// the default: reads HTTPS_PROXY, HTTP_PROXY and NO_PROXY (or their lowercase forms)
const fromEnv = createClient({ proxy: true });

const custom = createClient({
    proxy: {
        url: 'http://localhost:9080',    // replaces the environment variables
        noProxy: '.internal.example',    // hosts that skip the proxy
    },
});

const direct = createClient({ proxy: false });

await custom.get('https://status.internal.example/health', { proxy: false });
```

- Proxy support comes from [`node-fetch-native/proxy`](https://github.com/unjs/node-fetch-native); `ProxyOptions` is its option type. It is meant for Node.js; in browsers and workers the proxy step does nothing.
- While `proxy` is not `false`, the `agent` and `dispatcher` options of a request are replaced by the proxy's (which are `undefined` when no proxy URL is configured). To pass your own, set `proxy: false` or add them in a custom `FetchTransport` `fetch`.

## Building a service client

The `@hapic/*` packages extend `Client` with domain APIs. The pieces are exported, so you can build your own:

```typescript
import { BaseAPI, Client } from 'hapic';
import type { ClientOptionsInput } from 'hapic';

type Project = { id: number, name: string };

class ProjectAPI extends BaseAPI {
    async getOne(id: number): Promise<Project> {
        const { data } = await this.client.get(`projects/${id}`);

        return data;
    }
}

class RegistryClient extends Client {
    public readonly project: ProjectAPI;

    constructor(input: ClientOptionsInput = {}) {
        super(input);

        this.project = new ProjectAPI({ client: this });
    }
}

const registry = new RegistryClient({ baseURL: 'https://registry.example.com/api/' });
const project = await registry.project.getOne(1);
```

- `BaseAPI` takes `{ client }`: a client to share, or request options to create its own. Domain APIs issue every request through `this.client`.
- `createClientRegistry`, `markInstanceof`, `splitConnectionString` and `resolveConnectionOptions` cover the instance registry, the cross-realm `isClient` check and `credentials@host` connection strings.
- The [Building a Service Client](https://hapic.tada5hi.net/guide/building-a-client) guide walks through all of them.

## Notes

- **`fetch` resolves on `404`; hapic rejects.** Every status from 400 to 599 rejects with an `HttpResponseError`, and `error.response.data` holds the decoded body. Redirects are followed by `fetch` (`redirect: 'follow'`), so a `3xx` only reaches you with `redirect: 'manual'`, and then it resolves.
- **A `401` runs `responseError`, not `requestError`.** `requestError` is only for requests that got no response.
- **Setting `transform` drops the JSON encoding.** Your transformer replaces the default one. Add `createDefaultRequestTransformer()` to your array to keep it.
- **Per-request options replace, they do not merge.** A per-request `query`, `transform` or `responseTransform` replaces the client's. Only headers are layered.
- **Binary bodies need a `Blob` or `ArrayBuffer`.** The default transformer JSON-encodes typed arrays, `Buffer`s and web `ReadableStream`s.
- **Binary downloads need a `responseType`.** Without it, an unknown `Content-Type` is read as text and parsed as JSON where possible.
- **No `Content-Type` means a stream.** `data` is then the unread body (`null` for an empty body), and `responseTransform` does not run.
- **Retries are unbounded.** An error hook that returns `RequestOptions` runs the request again, through the same hooks. Stop the loop yourself.
- **A `Response` returned by an error hook is not decoded.** Its `data` is whatever you set.
- **Basic authorization needs `Buffer`.** `setAuthorizationHeader({ type: 'Basic', ... })`, `stringifyAuthorizationHeader` and `parseAuthorizationHeader` use the Node.js `Buffer` global. Without it (a browser without a polyfill) they throw a `ReferenceError`; set `authorization` to `` `Basic ${btoa(`${username}:${password}`)}` `` yourself.
- **The default export is not the registry's default client.** `import hapic from 'hapic'` and `useClient()` are two different clients.
- **`toOptions()` does not copy hooks.**
- **The proxy replaces a request's `agent` and `dispatcher`.** Set `proxy: false` to pass your own.

## Contributing

hapic is developed in the [tada5hi/hapic](https://github.com/tada5hi/hapic) monorepo. Its [README](https://github.com/tada5hi/hapic#development) lists the development commands; commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

Made with 💚

Published under [MIT License](./LICENSE).
