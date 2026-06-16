# Error Handling

hapic treats unsuccessful requests as **errors**, not values. Any response with a status in **400–599**, and any network/dispatch failure, rejects with a `ClientError`. This keeps your happy path clean — destructure `data` and move on — while failures surface loudly.

## The `ClientError`

`ClientError` is built on [`ebec`](https://www.npmjs.com/package/ebec) and carries the full context of what went wrong:

```typescript
import { ClientError } from 'hapic';

class ClientError<T = any> extends Error {
    request: RequestOptions;      // the options that were dispatched
    response?: Response<T>;       // present for HTTP errors, absent for network errors
    status?: number;              // response.status (alias: statusCode)
    statusCode?: number;
    statusText?: string;          // response.statusText (alias: statusMessage)
    statusMessage?: string;
    code?: ErrorCode | string;    // a machine-readable code (e.g. 'ECONNRESET')
}
```

A key distinction:

- **HTTP error** (4xx/5xx) → `response` is set, `status` reflects it.
- **Network error** (DNS failure, connection reset, abort) → `response` is `undefined`, and `code` is set instead.

## Prefer the guards over `instanceof`

If a consumer ends up with two bundled copies of hapic, a plain `error instanceof ClientError` can be `false` for an error thrown by the other copy. The exported guards use a cross-realm symbol check, so reach for them instead:

### `isClientError`

```typescript
import { isClientError } from 'hapic';

try {
    await client.get('users/1');
} catch (error) {
    if (isClientError(error)) {
        console.error(error.status, error.message);
    } else {
        throw error; // not ours — rethrow
    }
}
```

### `isClientErrorWithStatusCode`

Match a single status or any of several:

```typescript
import { isClientErrorWithStatusCode } from 'hapic';

if (isClientErrorWithStatusCode(error, 404)) { /* not found */ }
if (isClientErrorWithStatusCode(error, [401, 403])) { /* unauthorized */ }
```

It returns `false` for network errors (there's no response to inspect).

### `isClientErrorDueNetworkIssue`

True when the failure never produced a response — there's a `code` but no `response`:

```typescript
import { isClientErrorDueNetworkIssue } from 'hapic';

if (isClientErrorDueNetworkIssue(error)) {
    // connection reset, DNS failure, … — safe to retry with backoff
}
```

## Error codes

The `ErrorCode` enum names the non-HTTP failure modes:

```typescript
import { ErrorCode } from 'hapic';

ErrorCode.CONNECTION_ABORTED;            // 'ECONNABORTED'
ErrorCode.CONNECTION_CLOSED;             // 'ECONNRESET'
ErrorCode.AUTHORIZATION_HEADER_INVALID;  // 'auth_header_invalid'
ErrorCode.AUTHORIZATION_HEADER_PARSE;    // 'auth_header_parse'
ErrorCode.AUTHORIZATION_HEADER_TYPE_PARSE; // 'auth_header_type_parse'
```

## Recovering instead of throwing

Catching at the call site is the simplest path. But if you want to handle a failure class **centrally** — retry on 401, fall back to cache on a network blip — do it in an error hook, which can return a `Response` or retry `RequestOptions` so the error never reaches the caller:

```typescript
client.on('responseError', async (error) => {
    if (isClientErrorWithStatusCode(error, 401)) {
        return { ...error.request, headers: await freshAuthHeaders() };
    }
    throw error;
});
```

See [Hooks](/guide/hooks#error-hooks-can-recover) for the full recovery model.
