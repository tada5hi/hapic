# Testing

hapic dispatches every request through a **transport** — the single boundary between the request pipeline (header merge, URL/query building, hooks, transformers, response decoding, error handling) and the network. By default a client uses `FetchTransport`, which calls the cross-environment `fetch`. You can swap it for `MemoryTransport` in tests, so the **real** pipeline runs while no network call is made.

## The `transport` option

Every client accepts an optional `transport` alongside the usual request options:

```typescript
import { Client, FetchTransport } from 'hapic';

// default — equivalent to omitting `transport`
const client = new Client({
    baseURL: 'https://api.example.com/',
    transport: new FetchTransport(),
});
```

A transport implements a single method:

```typescript
interface ITransport {
    // request flattens RequestInit (merged headers, transformed body, method) alongside the
    // base-/query-resolved url. Must resolve with a raw Response (body unread) and must NOT
    // throw on a 4xx/5xx status.
    dispatch(request: RequestInit & { url: string, proxy?: ProxyOptions | boolean }): Promise<Response>;
}
```

## Testing with `MemoryTransport`

`MemoryTransport` records every dispatched request and serves a FIFO queue of canned responses. Because the request runs through the real client, your test verifies the **actual** URL, method, headers and body that would hit the wire — and the response decoding/shaping on the way back.

```typescript
import { MemoryTransport, createClient } from 'hapic';

const transport = new MemoryTransport();
transport.respondWith({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: { id: 1, name: 'Ada' }, // plain objects are JSON-serialized automatically
});

const client = createClient({ baseURL: 'https://api.test/', transport });

const response = await client.get('users/1');

// the real pipeline decoded the body
expect(response.data).toEqual({ id: 1, name: 'Ada' });

// and recorded the real request
expect(transport.lastRequest?.url).toBe('https://api.test/users/1');
expect(transport.lastRequest?.method).toBe('GET');
```

This works for service clients too — point a `@hapic/*` client (or a single domain `*API`) at a `MemoryTransport` to test your code without a live backend:

```typescript
import { MemoryTransport, createClient } from 'hapic';
import { ProjectAPI } from '@hapic/harbor';

const transport = new MemoryTransport();
transport.respondWith({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: [],
});

const api = new ProjectAPI({ client: createClient({ transport }) });
await api.getMany({ query: { page_size: 10 } });

expect(transport.lastRequest?.url).toBe('projects?page_size=10');
```

### API

| Member | Description |
|--------|-------------|
| `respondWith(init)` | Queue a single response. `init` is `{ status?, statusText?, headers?, body? }`; a plain object/array `body` is JSON-serialized (with a JSON `content-type` if none is set). A raw `Response` is also accepted. |
| `enqueue(...responders)` | Queue one or more responders (FIFO, one consumed per dispatch). A responder may be a response init, a `Response`, an `Error` (→ rejection), or a function `(request) => responder`. |
| `failNext(error?)` | Queue a rejection to drive the request-error path. |
| `requests` | Array of every recorded `{ url, init, proxy }` in dispatch order. |
| `lastRequest` | The most recently recorded request. |
| `reset()` | Clear the recorded requests and the responder queue. |

When the queue is empty, a dispatch resolves with an empty `200` response.

## Custom transports in production

The same seam configures real dispatch. Pass a custom `fetch` to `FetchTransport` to control TLS, a CA bundle, a client certificate, or keep-alive pooling — e.g. for mutual-TLS against Vault:

```typescript
import { Client, FetchTransport } from 'hapic';

const client = new Client({
    baseURL: 'https://vault.internal:8200/',
    transport: new FetchTransport({
        fetch: (input, init) => fetch(input, { ...init, /* dispatcher / agent with mTLS */ }),
    }),
});
```

Cross-cutting concerns that wrap a request — retry/refresh, logging, caching — belong in [hooks](./hooks.md), not in a custom transport.
