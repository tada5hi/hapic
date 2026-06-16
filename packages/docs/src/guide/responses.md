# Responses

A successful request resolves to a `Response`. It's the platform [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object, augmented with a decoded `data` property.

```typescript
const response = await useClient().get('users/1');

response.status;             // 200
response.statusText;         // 'OK'
response.headers.get('etag') // standard Headers object
response.data;               // the decoded body (lazy getter)
```

Most of the time you'll destructure `data` directly:

```typescript
const { data } = await useClient().get('users/1');
```

## How the body is decoded

After dispatch, hapic decodes the body using the `responseType` you set — or, if you didn't set one, by detecting it from the response's `Content-Type` header:

| `responseType` | `response.data` is… | Notes |
|----------------|---------------------|-------|
| `json` (default) | the parsed object/array | falls back to the raw text if `JSON.parse` fails |
| `text` | a `string` | |
| `blob` | a `Blob` | |
| `arrayBuffer` | an `ArrayBuffer` | |
| `stream` | a `ReadableStream` | the untouched `response.body` |

The values come from the exported `ResponseType` enum:

```typescript
import { ResponseType, useClient } from 'hapic';

const { data } = await useClient().get('archive.zip', {
    responseType: ResponseType.BLOB,
});
//      ^? Blob
```

::: tip JSON is forgiving
With the default `json` type, a body that isn't valid JSON won't throw — hapic returns the raw text instead. This keeps empty `204 No Content` bodies and plain-text error pages from blowing up your call.
:::

## Typing `data`

The response type flows through the generic parameters of the request methods. For JSON responses, the generic is the shape of `data`:

```typescript
interface User { id: number; name: string }

const { data } = await useClient().get<User>('users/1');
//      ^? User
```

For non-JSON `responseType`s, `data` is typed as the corresponding primitive (`string`, `Blob`, …) regardless of the generic.

## Transforming response data

Use `responseTransform` to normalize the decoded data before it reaches your code — for example to unwrap an envelope:

```typescript
const client = createClient({
    baseURL: 'https://api.example.com/',
    responseTransform: (data) => data?.result ?? data,
});
```

See [Transformers](/guide/transformers) for chaining and per-request transforms.

## Streaming responses

For large downloads, set `responseType: 'stream'` and consume `response.data` as a `ReadableStream`:

```typescript
const res = await useClient().get('large-export.ndjson', {
    responseType: 'stream',
});

const reader = res.data.getReader();
// … read chunks
```

## When there's no response

Network failures (DNS, connection reset, abort) never produce a `Response` — they throw a [`ClientError`](/guide/errors) whose `response` is `undefined`. Likewise, a 4xx/5xx **does** carry a `response`, but it's surfaced as a thrown error rather than a resolved value. The next two guides cover both paths.
