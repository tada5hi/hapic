# Proxy & Environments

hapic is designed to run the same code in **Node.js**, the **browser**, and **worker** runtimes. This page covers how it resolves platform APIs and how to configure an HTTP proxy.

## Cross-environment `fetch`

hapic never imports `node:` modules directly. Instead it resolves `fetch`, `Headers`, `Blob`, `FormData`, and `AbortController` from `globalThis` when they exist, and falls back to [`node-fetch-native`](https://www.npmjs.com/package/node-fetch-native) otherwise.

The practical upshot:

- **Modern Node.js**, browsers, Deno, Bun, and edge/worker runtimes use the platform `fetch`.
- **Older Node.js** (without a global `fetch`) transparently uses `node-fetch-native`.

There is a single entry point — no `hapic/node` vs. `hapic/browser` split — so the same `import` works everywhere.

## Proxy support

The `proxy` option controls outbound proxying (Node.js only — browsers manage proxies themselves). It accepts a boolean or a `ProxyOptions` object.

```typescript
import { createClient } from 'hapic';

// proxy is enabled by default: HTTP(S)_PROXY env vars are honored
const client = createClient({ baseURL: 'https://api.example.com/' });
```

### Honor environment variables (default)

When `proxy` is `true` (the default), hapic reads the standard proxy variables — `https_proxy`, `http_proxy`, `HTTPS_PROXY`, `HTTP_PROXY` (and `NO_PROXY`) — and routes requests accordingly.

```typescript
const client = createClient({ proxy: true });
```

### Disable proxying

```typescript
const client = createClient({ proxy: false });
```

### Custom proxy options

Pass an object to override the environment, set a specific proxy URL, or exclude hosts:

```typescript
const client = createClient({
    proxy: {
        url: 'http://localhost:9080', // overrides the env variables
        noProxy: '.internal.example', // hosts to bypass
    },
});
```

Proxy support comes from `node-fetch-native/proxy`; `ProxyOptions` is its option type.

### Per-request proxy

Like any option, `proxy` can be set per call — handy when one endpoint must bypass an otherwise-proxied client:

```typescript
await client.get('health', { proxy: false });
```

## Aborting requests

Because the options object is a `RequestInit`, cancellation uses the standard `AbortController`:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
    const { data } = await client.get('slow-endpoint', {
        signal: controller.signal,
    });
} finally {
    clearTimeout(timeout);
}
```

An aborted request rejects with a [`ClientError`](/guide/errors) — `isClientErrorDueNetworkIssue` and the `ErrorCode.CONNECTION_ABORTED` code help you distinguish it.
