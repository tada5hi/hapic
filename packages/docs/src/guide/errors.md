# Error Handling

hapic treats unsuccessful requests as **errors**, not values. Any response with a status in **400–599**, and any network/dispatch failure, rejects with a `ClientError`. This keeps your happy path clean — destructure `data` and move on — while failures surface loudly.

## The `ClientError` family

`ClientError` is built on [`@ebec/core`](https://www.npmjs.com/package/@ebec/core) and carries the full context of what went wrong. It is the **umbrella** type; every thrown error is a `ClientError` or one of its subclasses:

```typescript
import { ClientError } from 'hapic';

class ClientError<T = any> extends BaseError {   // BaseError comes from @ebec/core
    request: RequestOptions;      // the options that were dispatched
    response?: Response<T>;       // present for HTTP errors, absent for network errors
    status?: number;              // response.status (alias: statusCode)
    statusCode?: number;
    statusText?: string;          // response.statusText (alias: statusMessage)
    statusMessage?: string;
    code: string;                 // a machine-readable code, always set (e.g. 'ECONNRESET')
    cause?: unknown;              // the underlying error, when one exists
}
```

Two subclasses narrow the failure mode:

- **`HttpResponseError`** — the server answered with a `4xx`/`5xx` status. `response` and `status` are set; `code` defaults to `'HTTP_RESPONSE_ERROR'`.
- **`NetworkError`** — the request never produced a response (DNS failure, connection reset, abort). `response` is `undefined` and `code` carries the reason (e.g. `'ECONNRESET'`, `'ECONNABORTED'`).

```
BaseError (@ebec/core)
 └─ HapicError                    ← any hapic error; isHapicError()
     ├─ ClientError               ← request lifecycle; isClientError()
     │   ├─ NetworkError          ← no response; isNetworkError()
     │   └─ HttpResponseError     ← 4xx/5xx response; isHttpResponseError()
     ├─ AuthorizationHeaderError
     └─ ConnectionStringParseError   ← malformed connection string; isConnectionStringParseError()
```

`ConnectionStringParseError` lives in the base `hapic` package — thrown by its shared `splitConnectionString` helper and re-exported by the service clients (`@hapic/harbor`, `@hapic/vault`) that accept a connection string, so a single `isConnectionStringParseError` recognises it everywhere.

Every error a `@hapic/*` package throws descends from `HapicError`, so `isHapicError(e)` answers "did this come from hapic?" — even for config/auth errors that aren't request failures.

## Prefer the guards over `instanceof`

If a consumer ends up with two bundled copies of hapic, a plain `error instanceof ClientError` can be `false` for an error thrown by the other copy. The exported guards instead consult a cross-realm **marker chain**: every error records a marker for itself *and* for each of its ancestors, so a single instance is matched by every guard in its lineage — an `HttpResponseError` answers `true` to both `isHttpResponseError` **and** `isClientError`.

### `isHapicError`

The broadest guard — matches *any* error thrown by *any* hapic package (request, auth, or connection), and nothing else:

```typescript
import { isHapicError } from 'hapic';

try {
    await client.get('users/1');
} catch (error) {
    if (isHapicError(error)) {
        // came from hapic — safe to read error.code / error.message
    } else {
        throw error; // some other library's error — rethrow
    }
}
```

### `isClientError`

Narrower than `isHapicError` — matches errors from the HTTP **request lifecycle** (network or HTTP response), but not config/auth errors:

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

### `isHttpResponseError` / `isNetworkError`

Branch on the failure mode directly:

```typescript
import { isHttpResponseError, isNetworkError } from 'hapic';

if (isHttpResponseError(error)) {
    console.error(`server said ${error.status}`);
}

if (isNetworkError(error)) {
    // never reached the server — safe to retry with backoff
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

True when the failure never produced a response and was not an explicit abort — there's a `code` but no `response`:

```typescript
import { isClientErrorDueNetworkIssue } from 'hapic';

if (isClientErrorDueNetworkIssue(error)) {
    // connection reset, DNS failure, … — safe to retry with backoff
}
```

## Error codes

Every `ClientError` exposes a `code`. For HTTP errors it derives from the class name (`'HTTP_RESPONSE_ERROR'`); for the non-HTTP failure modes the `ErrorCode` enum names them:

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
