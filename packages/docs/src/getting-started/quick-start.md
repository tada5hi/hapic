# Quick Start

A `Client` holds a set of **defaults** (a `baseURL`, headers, transformers, proxy settings) and exposes method shortcuts — `get`, `post`, `put`, `patch`, `delete`, `head` — that resolve a URL, run the request lifecycle, decode the body, and either return a typed `Response` or throw a `ClientError`.

## Create a client

```typescript
import { createClient } from 'hapic';

const client = createClient({
    baseURL: 'https://jsonplaceholder.typicode.com/',
});
```

`createClient(options)` is a thin wrapper around `new Client(options)`. If you don't need a `baseURL` you can import the **default instance** instead:

```typescript
import client from 'hapic';

const { data } = await client.get('https://jsonplaceholder.typicode.com/users/1');
```

## Make requests

Every method returns a `Response` whose `data` property holds the decoded body. JSON responses are parsed automatically.

```typescript
// GET — read a resource
const { data: user } = await client.get<User>('users/1');

// POST — create a resource (body is serialized, Content-Type set)
const { data: created } = await client.post('users', { name: 'Peter' });

// PATCH — partial update
await client.patch(`users/${created.id}`, { name: 'Peter P.' });

// DELETE
await client.delete(`users/${created.id}`);
```

Pass a generic to type the decoded `data`:

```typescript
interface User {
    id: number;
    name: string;
}

const { data } = await client.get<User[]>('users');
//      ^? Response<User[]>
```

## Handle errors

hapic throws a `ClientError` for any response in the **400–599** range, and for network/dispatch failures. Use the duck-typed guards rather than `instanceof` — they work across realm boundaries (e.g. multiple bundled copies of the package):

```typescript
import { isClientError, isClientErrorWithStatusCode } from 'hapic';

try {
    await client.get('users/99999');
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        console.warn('user not found');
    } else if (isClientError(error)) {
        console.error(error.status, error.message);
    } else {
        throw error;
    }
}
```

The `ClientError` carries the originating `request`, the `response` (when there is one), and the `status`. See [Error Handling](/guide/errors) for the full surface.

## Add authorization

Set an authorization header once, and it applies to every subsequent request:

```typescript
client.setAuthorizationHeader({ type: 'Bearer', token: '<access-token>' });

// Basic auth
client.setAuthorizationHeader({ type: 'Basic', username: 'admin', password: 'secret' });

// API key
client.setAuthorizationHeader({ type: 'X-API-Key', key: '<api-key>' });
```

See [Headers & Authorization](/guide/headers) for details.

## Going further

- [The Client](/guide/client) — every configuration option.
- [Hooks](/guide/hooks) — intercept and recover from requests, responses, and errors.
- [Instance Registry](/guide/instance) — share one configured client across your app.
- [Packages](/packages/) — typed clients for Harbor, Vault, Loki, VictoriaLogs, and OAuth2.
