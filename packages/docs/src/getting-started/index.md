# Introduction

**hapic** — short for "**H**TTP **API** **C**lient" — is a tiny, [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)-based HTTP client for TypeScript. It wraps the platform `fetch` with the ergonomics you reach for in every real project, and nothing you don't:

> Method shortcuts, a `baseURL`, request/response/error hooks, body & header transformers, authorization helpers, proxy support, and automatic error throwing on non-2xx responses.

It runs unchanged in **Node.js**, the **browser**, and **worker** runtimes, and ships both ESM and CommonJS builds.

## Two layers

hapic is built in two layers, and you can use either:

| Layer | What it is |
|-------|-----------|
| **`hapic`** | The base `Client` — a thin, typed wrapper around `fetch` that owns the whole request lifecycle. |
| **`@hapic/*`** | A family of service clients (`harbor`, `oauth2`, `vault`, `loki`, `victorialogs`) that **extend** the base `Client` with typed, domain-oriented APIs. |

Every service client reuses the same transport, hooks, and instance registry — so once you know the base `Client`, you know all of them.

## Why hapic?

- You want **`fetch` semantics** with a few quality-of-life additions, not a megabyte of abstraction.
- You want **non-2xx responses to throw**, with a typed `ClientError` carrying the request, response, and status.
- You want **hooks** that can not only observe but *recover* — return a `Response` to swallow an error, or new `RequestOptions` to retry (token refresh in a few lines).
- You want the **same client** to run in Node, the browser, and edge/worker runtimes.
- You're talking to **Harbor, Vault, Loki, VictoriaLogs, or an OAuth2 provider** and want a typed client instead of hand-rolled URLs.

## Next steps

- [Installation](/getting-started/installation) — install the base client or a service package.
- [Quick Start](/getting-started/quick-start) — make your first request and handle an error.
- [Guide → The Client](/guide/client) — every configuration option, in detail.
- [Packages](/packages/) — pick a typed client for the service you run.
