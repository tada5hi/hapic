# Request Methods

Every request ultimately runs through `Client.request(config)`, but you'll rarely call it directly. The method shortcuts cover the common HTTP verbs and read more naturally.

All of them return a `Promise<Response>` whose `data` holds the decoded body. They throw a [`ClientError`](/guide/errors) for non-2xx responses.

## The shortcuts

| Method | Signature | Sends a body? |
|--------|-----------|:-------------:|
| `get`    | `get(url, config?)`        | — |
| `delete` | `delete(url, config?)`     | — |
| `head`   | `head(url, config?)`       | — |
| `post`   | `post(url, body?, config?)`| ✓ |
| `put`    | `put(url, body?, config?)` | ✓ |
| `patch`  | `patch(url, body?, config?)`| ✓ |

For methods that don't carry a payload (`get` / `delete` / `head`), any body is stripped before dispatch.

### Reading data — `GET`

```typescript
import { useClient } from 'hapic';

const { data } = await useClient().get('users');
// data → [{ id: 1, name: 'Peter' }, …]
```

### Creating — `POST`

The body is the second argument. Plain objects are serialized to JSON and the `Content-Type` header is set for you.

```typescript
const { data } = await useClient().post('users', { name: 'Peter' });
// data → { id: 3, name: 'Peter' }
```

### Replacing & updating — `PUT` / `PATCH`

```typescript
await useClient().put('users/3', { id: 3, name: 'Hans' });
await useClient().patch('users/3', { name: 'Hans P.' });
```

### Removing — `DELETE`

```typescript
await useClient().delete('users/3');
```

### Checking — `HEAD`

`HEAD` fetches headers without a body — handy for existence or metadata checks.

```typescript
const res = await useClient().head('users/3');
console.log(res.status, res.headers.get('etag'));
```

## Typing the response

Pass a generic to type `response.data`:

```typescript
interface User { id: number; name: string }

const { data } = await useClient().get<User[]>('users');
//      ^? User[]

const created = await useClient().post<User>('users', { name: 'Peter' });
//    ^? Response<User>
```

## Query parameters

Use `query` (or its alias `params`) to build a query string. Both are merged and URL-encoded; `bigint` values are stringified automatically.

```typescript
await useClient().get('users', {
    query: { page: 2, page_size: 25, sort: 'name' },
});
// → GET users?page=2&page_size=25&sort=name
```

## Per-request configuration

The trailing `config` argument accepts the same [`RequestBaseOptions`](/guide/client#configuration-options) as the constructor — so you can override the `baseURL`, add headers, change the `responseType`, attach an `AbortSignal`, and more, for a single call:

```typescript
const controller = new AbortController();

const { data } = await useClient().get('report.csv', {
    responseType: 'text',
    headers: { accept: 'text/csv' },
    signal: controller.signal,
});
```

A per-request `timeout` (milliseconds) bounds a single call and overrides the client default. It combines with a `signal`: whichever fires first aborts the request.

```typescript
const { data } = await useClient().get('report.csv', {
    signal: controller.signal,
    timeout: 5_000,
});
```

## Upload progress

Pass `onUploadProgress` to follow how much of the request body has been sent, e.g. for a progress bar. It is called with `loaded` (the bytes sent so far) and `total` (the body size in bytes, `undefined` when it is not known):

```typescript
await useClient().post('media', file, {
    headers: { 'x-file-name': encodeURIComponent(file.name) },
    onUploadProgress: ({ loaded, total }) => {
        bar.value = total ? loaded / total : 0;
    },
    signal: controller.signal,
});
```

Only the dispatch changes: the base URL, headers, hooks (a hook retrying the request keeps the listener, so the retry reports progress too), `timeout`, `signal` and response decoding work as for any request. The default `FetchTransport` picks how to send the body:

| Where | How |
|-------|-----|
| `XMLHttpRequest` exists (browsers) | Sent by `XMLHttpRequest`, reporting its `upload` progress events. Not used when the transport has a custom `fetch`, the request has a `proxy` options object or the body is a stream. |
| Node.js | Sent by `fetch` as a stream counting the bytes it hands out (`duplex: 'half'`). A body of known size keeps its `content-length` and `content-type`; a form data body is read into memory first to know its size. |
| Elsewhere | Sent by `fetch` as usual; one event (`loaded` = `total`) is reported once the body is sent, when its size is known. |

A request with `responseType: 'stream'` is never sent by `XMLHttpRequest`, which would hold the response back until it is complete; it goes by `fetch` instead.

A response received by `XMLHttpRequest` carries the final `url` and `redirected`, as one from `fetch` does.

A request without a body reports nothing, and an error thrown by the listener is ignored. In browsers, a request with an upload listener is never a CORS "simple request", so an upload to another origin is preflighted.

To send every request by `XMLHttpRequest`, use the `XhrTransport`. It reads the whole response before resolving (no streamed responses), ignores the `proxy` option and passes a request it cannot send (no `XMLHttpRequest`, a stream body or `responseType: 'stream'`) to its `fallback` transport (default: a `FetchTransport`):

```typescript
import { Client, XhrTransport } from 'hapic';

const client = new Client({ baseURL: 'https://api.example.com/', transport: new XhrTransport() });
```

## The generic `request`

When you need full control — or a verb without a shortcut — call `request` directly with a `url` and `method`:

```typescript
import { MethodName, useClient } from 'hapic';

const { data } = await useClient().request({
    method: MethodName.POST,
    url: 'users',
    body: { name: 'Peter' },
    query: { dryRun: true },
});
```

`MethodName` is an exported enum (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`) — or pass the plain string.

## What's next

- [Responses](/guide/responses) — the `Response` object and how bodies are decoded.
- [Transformers](/guide/transformers) — reshape the body before it's sent.
