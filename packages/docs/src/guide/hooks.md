# Hooks

Hooks let you intercept the request lifecycle at four points: before a request is sent, after a response arrives, and when either step errors. Register them with `on(name, fn)` and remove them with `off(name, fn?)`.

```typescript
import { HookName } from 'hapic';

HookName.REQUEST;         // 'request'
HookName.RESPONSE;        // 'response'
HookName.REQUEST_ERROR;   // 'requestError'
HookName.RESPONSE_ERROR;  // 'responseError'
```

You can register multiple hooks for the same name; they run in registration order, each receiving the (possibly modified) value from the previous one.

## `request` — before dispatch

A request hook receives the resolved `RequestOptions` and must return them (optionally mutated). Use it to inject headers, add a transformer, or rewrite the URL.

```typescript
import { useClient } from 'hapic';

useClient().on('request', (options) => {
    options.headers.set('x-request-id', crypto.randomUUID());
    return options;
});
```

It can be `async` — return a `Promise<RequestOptions>` if you need to await something (e.g. loading a token from storage).

## `response` — after a 2xx/3xx

A response hook receives the `Response` (with its decoded `data`) and returns it. Any status **not** in 400–599 reaches here.

```typescript
useClient().on('response', (res) => {
    console.debug(`${res.status} ${res.url}`);
    return res;
});
```

## Error hooks can recover

This is what sets hapic's hooks apart. `requestError` fires on network/dispatch failures; `responseError` fires on a 400–599 status. Both receive a [`ClientError`](/guide/errors), and what you return decides the outcome:

| The error hook returns… | Result |
|-------------------------|--------|
| **nothing** (or throws) | the `ClientError` is thrown to the caller |
| a **`Response`** | that response is used as the result — the error is swallowed |
| **`RequestOptions`** | the request is **retried** by re-running `request` with those options |

### Retry: refresh an expired token

```typescript
import { createClient, isClientErrorWithStatusCode } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });

client.on('responseError', async (error) => {
    if (isClientErrorWithStatusCode(error, 401)) {
        const token = await refreshAccessToken();

        // returning RequestOptions re-runs the original request
        return {
            ...error.request,
            headers: {
                ...error.request.headers,
                authorization: `Bearer ${token}`,
            },
        };
    }

    // everything else keeps throwing
    throw error;
});
```

::: warning Guard against retry loops
A retried request runs the whole lifecycle again — including this hook. If the retry also fails the same way, you can loop. Gate retries on a condition that changes (a fresh token) or track an attempt counter on the options.
:::

### Recover: serve a fallback `Response`

```typescript
import { useClient, isClientErrorDueNetworkIssue } from 'hapic';

useClient().on('requestError', (error) => {
    if (isClientErrorDueNetworkIssue(error)) {
        // synthesize a Response from cache instead of failing
        return caches.get(error.request.url);
    }
    throw error;
});
```

## Removing hooks

`on()` returns a numeric **id**. Pass it to `off(name, id)` to remove that one hook, or call `off(name)` to remove all hooks for a name.

```typescript
const id = useClient().on('request', addRequestId);

useClient().off('request', id);   // remove just this hook
useClient().off('request');       // remove every request hook
```

## Hook function types

The exported types document the contracts:

```typescript
import type { HookReqFn, HookResFn, HookErrorFn } from 'hapic';

type HookReqFn   = (options: RequestOptions) => RequestOptions | Promise<RequestOptions>;
type HookResFn   = (response: Response) => Response | Promise<Response>;
type HookErrorFn = (error: ClientError) =>
    | RequestOptions | Response
    | Promise<RequestOptions | Response>;
```
