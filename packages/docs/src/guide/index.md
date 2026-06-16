# Overview

This guide covers the **base `hapic` package** — the `Client` class and everything around it. If you're using a service client like `@hapic/harbor`, everything here applies too: those clients *are* a `Client`, extended with typed domain APIs.

## The request lifecycle

The heart of hapic is `Client.request(config)`. Every method shortcut (`get`, `post`, …) funnels into it. A single call walks these steps in order:

1. **Build headers** — merge the per-request headers over the client's default headers.
2. **Resolve the URL** — apply `baseURL`, then append `params` / `query` (with `bigint` values stringified).
3. **Request hooks** — run every `request` hook; each may rewrite the options.
4. **Transformers** — apply the `transform` function(s) to the body (and headers).
5. **Dispatch** — call `fetch`, with or without a proxy.
6. **Decode** — pick a decoder by `responseType`, or detect it from the `Content-Type` header: `stream` · `blob` · `arrayBuffer` · `text` · `json`.
7. **Error check** — a status of **400–599** builds a `ClientError` and runs the error hooks.
8. **Response hooks** — run every `response` hook; each may rewrite the response.

The decoded body is exposed lazily as `response.data`.

## A map of the guide

**Concepts**
- [The Client](/guide/client) — construct and configure a client; every option explained.
- [Instance Registry](/guide/instance) — create / use / set named singleton clients.

**Making Requests**
- [Request Methods](/guide/request-methods) — `get` / `post` / `put` / `patch` / `delete` / `head` and the generic `request`.
- [Responses](/guide/responses) — the `Response` object, `responseType`, and body decoding.
- [Headers & Authorization](/guide/headers) — default headers and the Basic / Bearer / API-key helpers.

**The Pipeline**
- [Hooks](/guide/hooks) — intercept and recover from requests, responses, and errors.
- [Transformers](/guide/transformers) — shape outgoing bodies and incoming data.
- [Error Handling](/guide/errors) — `ClientError`, error codes, and the guard helpers.

**Advanced**
- [Proxy & Environments](/guide/proxy) — proxy support and the cross-environment `fetch` resolution.
- [Building a Service Client](/guide/building-a-client) — extend `Client` with your own domain APIs, the way the `@hapic/*` packages do.

## A quick mental model

```typescript
import { createClient } from 'hapic';

const client = createClient({
    baseURL: 'https://api.example.com/',
    headers: { accept: 'application/json' },
});

// defaults + per-request options are merged for every call
const { data } = await client.get('users', {
    query: { page: 1, page_size: 25 },
});
```

A `Client` is just **defaults + headers + a hook manager**, wrapped around `fetch`. Keep that in mind and the rest of the API falls into place.
