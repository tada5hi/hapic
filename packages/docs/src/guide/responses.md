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

It also applies to error responses (`error.response.data`), but not to `responseType: 'stream'`. See [Transformers](/guide/transformers) for chaining and per-request transforms.

## Streaming responses

For large downloads, set `responseType: 'stream'` and consume `response.data` as a `ReadableStream`:

```typescript
const res = await useClient().get('large-export.ndjson', {
    responseType: 'stream',
});

const reader = res.data.getReader();
// … read chunks
```

## Server-sent events

A `text/event-stream` response is detected as `stream`, because it stays open and can not be buffered. Pass the response (or `response.data`) to `parseEventStream()` to read its events:

```typescript
import { parseEventStream, useClient } from 'hapic';

const res = await useClient().get('events');

for await (const message of parseEventStream(res)) {
    console.log(message.type, message.data);
}
```

Each message has the shape of a browser `MessageEvent`:

| Property | Description |
|----------|-------------|
| `type` | the `event` field, `message` if absent |
| `data` | the `data` fields, joined with a line feed |
| `lastEventId` | the last `id` seen on the stream, `''` if none |
| `retry` | the stream's current reconnection time in milliseconds: the last valid `retry` field seen on the stream, also when it was sent in a block without `data`; absent until one is received |

Comments (`: ping`) are skipped, and an event which is not terminated by a blank line when the stream ends is discarded. For a stream that is already decoded to text, pipe it through `EventStreamParserStream` instead:

```typescript
import { EventStreamParserStream } from 'hapic';

const messages = textStream.pipeThrough(new EventStreamParserStream());
```

`parseEventStream()` reads a single response; it does not reconnect.

## When there's no response

Network failures (DNS, connection reset, abort) never produce a `Response` — they throw a [`ClientError`](/guide/errors) whose `response` is `undefined`. Likewise, a 4xx/5xx **does** carry a `response`, but it's surfaced as a thrown error rather than a resolved value. The next two guides cover both paths.
