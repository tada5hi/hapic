# The Client

The `Client` class is the entire base library. You construct one with a set of **defaults**, and every request merges its per-call options over those defaults.

## Constructing a client

There are three equivalent ways to get a client:

```typescript
import { Client, createClient, useClient } from 'hapic';

// 1. directly
const a = new Client({ baseURL: 'https://api.example.com/' });

// 2. factory (identical, reads nicer)
const b = createClient({ baseURL: 'https://api.example.com/' });

// 3. a named singleton from the registry
const c = useClient(); // see the Instance Registry guide
```

The constructor takes a `RequestBaseOptions` object. Every field is optional.

## Configuration options

`RequestBaseOptions` extends the platform [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit), so **all** standard fetch options (`headers`, `credentials`, `mode`, `cache`, `signal`, …) are available too, plus the hapic-specific additions below.

```typescript
import { createClient, ResponseType } from 'hapic';

const client = createClient({
    // --- standard RequestInit (passed through to fetch) ---
    headers: { accept: 'application/json' },
    credentials: 'include',

    // --- hapic additions ---
    baseURL: 'https://api.example.com/',
    responseType: ResponseType.JSON,
    params: { tenant: 'acme' },
    proxy: true,
    transform: (body, headers) => body,
    responseTransform: (data) => data,
});
```

| Option | Type | Purpose |
|--------|------|---------|
| `baseURL` | `string` | Prefixed in front of each request URL. A relative request URL is resolved against it. |
| `body` | `BodyInit \| Record<string, any>` | Default request body. Plain objects are serialized by the default transformer. |
| `responseType` | `'json' \| 'text' \| 'blob' \| 'arrayBuffer' \| 'stream'` | Force how the response body is decoded. Defaults to detection from the `Content-Type` header. |
| `params` | `Record<string, any>` | Query-string parameters appended to the URL. |
| `query` | `Record<string, any>` | Alias for `params`; both are merged. |
| `transform` | `RequestTransformer \| RequestTransformer[]` | Function(s) that reshape the outgoing body and headers. See [Transformers](/guide/transformers). |
| `responseTransform` | `ResponseTransformer \| ResponseTransformer[]` | Function(s) that reshape the decoded response data. |
| `proxy` | `ProxyOptions \| boolean` | Proxy configuration. `true` (default) honours `HTTP(S)_PROXY` env vars; `false` disables. See [Proxy & Environments](/guide/proxy). |

::: tip RequestInit lives here too
Because the options object **is** a `RequestInit`, anything fetch accepts works: `method`, `credentials`, `mode`, `cache`, `redirect`, `signal` (for `AbortController`), and so on.
:::

## Defaults vs. per-request options

The options you pass to the constructor become `client.defaults`. Each request shallow-merges its own options on top:

```typescript
const client = createClient({
    baseURL: 'https://api.example.com/',
    headers: { accept: 'application/json' },
});

// uses the default baseURL and accept header,
// adds a per-request query and overrides responseType
const { data } = await client.get('report.csv', {
    query: { from: '2026-01-01' },
    responseType: 'text',
});
```

Per-request headers are **merged** over the client's default headers (the request wins on conflicts). Other options are replaced wholesale.

## Reading & changing the base URL

```typescript
client.getBaseURL();                       // 'https://api.example.com/'
client.setBaseURL('https://api.acme.dev/'); // returns `this` — chainable
```

## Managing headers

`setHeader` / `getHeader` / `unsetHeader` operate on the client's default headers; they apply to every upcoming request. All header setters return `this`, so they chain:

```typescript
client
    .setHeader('accept', 'application/json')
    .setHeader('x-tenant', 'acme');

client.getHeader('accept');   // 'application/json'
client.unsetHeader('x-tenant');
client.unsetHeaders();        // clear all default headers
```

For authorization specifically, prefer the dedicated helpers covered in [Headers & Authorization](/guide/headers).

## What's next

- [Request Methods](/guide/request-methods) — the verbs you'll call most.
- [Instance Registry](/guide/instance) — reuse one configured client across modules.
