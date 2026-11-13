# Transformers

Transformers reshape data as it crosses the wire — the **request** body on the way out, and the decoded **response** data on the way in. They're plain functions, so they compose and test easily.

## Request transformers

A request transformer receives the body and the request `Headers`, and returns the body to send. Because it has the headers, it can set the `Content-Type` to match what it produced.

```typescript
import type { RequestTransformer } from 'hapic';

const toForm: RequestTransformer = (data, headers) => {
    headers.set('content-type', 'application/x-www-form-urlencoded');
    return new URLSearchParams(data).toString();
};

const client = createClient({
    baseURL: 'https://api.example.com/',
    transform: toForm,
});

await client.post('login', { username: 'admin', password: 'secret' });
// body → "username=admin&password=secret"
```

Set `transform` on the client (applies to every request) or per call:

```typescript
await client.post('login', payload, { transform: toForm });
```

### Chaining

Pass an array to run several transformers in order — each receives the previous one's output:

```typescript
const client = createClient({
    transform: [
        (data) => ({ ...data, sentAt: Date.now() }),
        (data, headers) => {
            headers.set('content-type', 'application/json');
            return JSON.stringify(data);
        },
    ],
});
```

### The default transformer

Out of the box, hapic serializes plain objects to JSON and sets `Content-Type: application/json` for you — which is why `client.post('users', { name: 'Peter' })` "just works". Bodies that are already `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, or a stream are passed through untouched.

When you provide your own `transform`, you take over that step — so set the `Content-Type` yourself, as the examples above do.

## Response transformers

A response transformer receives the **decoded** `data` and returns the value that becomes `response.data`. Use it to unwrap envelopes, rename fields, or revive dates.

```typescript
import type { ResponseTransformer } from 'hapic';

const unwrap: ResponseTransformer = (data) => data?.result ?? data;

const client = createClient({
    baseURL: 'https://api.example.com/',
    responseTransform: unwrap,
});

const { data } = await client.get('users/1');
// if the server returns { result: {…} }, `data` is the inner object
```

Like request transformers, `responseTransform` accepts a single function or an array, on the client or per request. An array runs in order, each function receiving the previous output, and a per-request `responseTransform` replaces the client one.

It runs on every decoded body, including 4xx/5xx responses (so `error.response.data` is transformed too), and is skipped when the body is left as a stream (`responseType: 'stream'`, or a detected `text/event-stream`), since nothing is decoded.

Each function receives the decoded data, the response headers and the status. Use the status to treat an error body differently:

```typescript
const client = createClient({
    responseTransform: (data, headers, status) => {
        if (status >= 400) {
            return data?.error ?? data;
        }

        return data?.result ?? data;
    },
});
```

A transformer written for the success shape alone still runs on error bodies. If it throws there, the body is left untransformed and the usual `HttpResponseError` is thrown, so error hooks keep working. If it returns `undefined` for a shape it does not know, `error.response.data` loses the error details, so check the status or fall back to the input as above. A transformer that throws on a successful response is not caught.

## Transformers vs. hooks

Both can touch a request, so which do you use?

| Use a **transformer** when… | Use a **hook** when… |
|------------------------------|----------------------|
| you're (de)serializing the **body/data** | you need the whole `RequestOptions` or `Response` |
| the change is a pure data mapping | you need to **retry** or **recover** from errors |
| it's scoped to specific requests | it's a cross-cutting concern (logging, request ids, auth) |

In fact, a request hook can *install* a transformer dynamically:

```typescript
client.on('request', (options) => {
    options.transform = (data, headers) => {
        headers.set('authorization', `Bearer ${currentToken()}`);
        return data;
    };
    return options;
});
```

See [Hooks](/guide/hooks) for the lifecycle and recovery semantics.
