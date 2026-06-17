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

`MemoryTransport` records every dispatched request and answers it with a `fetch` handler you pass to the constructor. Because the request runs through the real client, your test verifies the **actual** URL, method, headers and body that would hit the wire — and the response decoding/shaping on the way back.

```typescript
import { MemoryTransport, createClient } from 'hapic';

const transport = new MemoryTransport({
    fetch: () => ({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { id: 1, name: 'Ada' }, // plain objects are JSON-serialized automatically
    }),
});

const client = createClient({ baseURL: 'https://api.test/', transport });

const response = await client.get('users/1');

// the real pipeline decoded the body
expect(response.data).toEqual({ id: 1, name: 'Ada' });

// and recorded the real request
expect(transport.requests.at(-1)?.url).toBe('https://api.test/users/1');
expect(transport.requests.at(-1)?.method).toBe('GET');
```

This works for service clients too — point a `@hapic/*` client (or a single domain `*API`) at a `MemoryTransport` to test your code without a live backend:

```typescript
import { MemoryTransport, createClient } from 'hapic';
import { ProjectAPI } from '@hapic/harbor';

const transport = new MemoryTransport({
    fetch: () => ({
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: [],
    }),
});

const api = new ProjectAPI({ client: createClient({ transport }) });
await api.getMany({ query: { page_size: 10 } });

expect(transport.requests.at(-1)?.url).toBe('projects?page_size=10');
```

### API

| Member | Description |
|--------|-------------|
| `new MemoryTransport({ fetch })` | `fetch(request)` handles every dispatch. Return a `MemoryResponseInit` — `{ status?, statusText?, headers?, body? }` (a plain object/array `body` is JSON-serialized, with a JSON `content-type` if none is set) — or a raw `Response` to use as-is. **Throw** (or reject) to drive the request-error path. |
| `requests` | Array of every recorded request (`RequestInit & { url, proxy }`) in dispatch order; use `requests.at(-1)` for the most recent. |
| `reset()` | Clear the recorded requests. The `fetch` handler is left in place. |

With no `fetch` handler, every dispatch resolves with an empty `200` response. To vary the response by request, branch inside the handler (e.g. on `request.url` / `request.method`); for different responses on successive calls, keep a counter in the handler's closure.

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
