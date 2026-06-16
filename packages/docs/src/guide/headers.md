# Headers & Authorization

A client keeps a set of **default headers** that are merged into every request. You manage them with chainable setters, and there are dedicated helpers for the common authorization schemes.

## Default headers

```typescript
const client = createClient({
    headers: { accept: 'application/json' },
});

client
    .setHeader('accept', 'application/json')
    .setHeader('x-tenant', 'acme');

client.getHeader('accept');   // 'application/json'
client.unsetHeader('x-tenant');
client.unsetHeaders();        // remove every default header
```

Header names are case-insensitive (they go through a `Headers` object). Per-request headers passed in a method's `config` are merged on top of the defaults, and win on conflicts:

```typescript
// overrides `accept` for just this call
await client.get('report.csv', { headers: { accept: 'text/csv' } });
```

The exported `HeaderName` enum holds the few names hapic itself uses:

```typescript
import { HeaderName } from 'hapic';

HeaderName.ACCEPT;        // 'accept'
HeaderName.AUTHORIZATION; // 'authorization'
HeaderName.CONTENT_TYPE;  // 'content-type'
```

## Authorization helpers

Rather than format an `Authorization` header by hand, pass a typed descriptor to `setAuthorizationHeader`. hapic serializes it correctly and sets the header for every upcoming request.

### Bearer

```typescript
client.setAuthorizationHeader({
    type: 'Bearer',
    token: '<access-token>',
});
// Authorization: Bearer <access-token>
```

### Basic

```typescript
client.setAuthorizationHeader({
    type: 'Basic',
    username: 'admin',
    password: 'secret',
});
// Authorization: Basic YWRtaW46c2VjcmV0   (base64 of "admin:secret")
```

### API key

The `API-Key` and `X-API-Key` types both carry a `key`:

```typescript
client.setAuthorizationHeader({
    type: 'X-API-Key',
    key: '<api-key>',
});
```

### Reading & clearing

```typescript
client.getAuthorizationHeader();    // the raw header string, or undefined
client.unsetAuthorizationHeader();  // remove it
```

All three setters return `this`, so they chain with the other header methods.

## The `AuthorizationHeader` type

The descriptor is a discriminated union, exported for reuse:

```typescript
import type { AuthorizationHeader } from 'hapic';

type AuthorizationHeader =
    | { type: 'Basic'; username: string; password: string }
    | { type: 'Bearer'; token: string }
    | { type: 'API-Key' | 'X-API-Key'; key: string };
```

This same descriptor shape is accepted by several service clients (for example `@hapic/oauth2`'s `userInfo.get(header)` and the token request options), so you can build one auth object and pass it around.

## Setting auth per request, or in a hook

`setAuthorizationHeader` sets a **default**. For one-off auth, pass an `authorization` header in the request config; to compute auth dynamically (refresh tokens, signing), set it from a [request hook](/guide/hooks):

```typescript
client.on('request', (options) => {
    options.headers.set('authorization', `Bearer ${currentToken()}`);
    return options;
});
```
