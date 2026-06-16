# @hapic/oauth2

An OAuth2 / OpenID Connect client — build authorization URLs, exchange every grant type for tokens, introspect and revoke them, and fetch userinfo. It extends the base [`Client`](/guide/client) and overrides the cross-realm symbol with `Symbol.for('OAuth2Client')`.

## Installation

```bash
npm install hapic @hapic/oauth2 --save
```

## Creating a client

`OAuth2Client` takes a `request` block (base client options) and an `options` block describing the provider's endpoints and your credentials.

```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'https://auth.example.com/',
    },
    options: {
        clientId: 'my-app',
        clientSecret: 'super-secret',
        redirectUri: 'https://app.example.com/callback',
        tokenEndpoint: '/oauth2/token',
        authorizationEndpoint: '/oauth2/authorize',
        userinfoEndpoint: '/oauth2/userinfo',
        scope: ['openid', 'profile', 'email'],
    },
});
```

The package exports the usual registry (`createClient`, `useClient`, `setClient`, …) — see [Instance Registry](/guide/instance).

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.authorize` | `AuthorizeAPI` | `buildURL(params?)` |
| `client.token` | `TokenAPI` | `createWithClientCredentials` · `createWithPassword` · `createWithAuthorizationCode` · `createWithRefreshToken` · `create` · `introspect` · `revoke` |
| `client.userInfo` | `UserInfoAPI` | `get(header?)` |

## Token grants

Each grant has a dedicated, typed method that returns a `TokenGrantResponse` (`access_token`, `token_type`, `expires_in`, and optionally `refresh_token` / `id_token`).

### Client credentials (service-to-service)

```typescript
const token = await client.token.createWithClientCredentials({
    scope: 'api:read',
});
// { access_token, token_type: 'Bearer', expires_in, … }
```

### Resource owner password

```typescript
const token = await client.token.createWithPassword({
    username: 'admin',
    password: 'start123',
});
```

### Authorization code

```typescript
// 1. send the user to the authorization endpoint
const url = client.authorize.buildURL({
    state: 'csrf-token',
    scope: ['openid', 'profile'],
});
// redirect the browser to `url`

// 2. exchange the returned code in your callback handler
const token = await client.token.createWithAuthorizationCode({
    code: codeFromCallback,
});
```

### Refresh

```typescript
const refreshed = await client.token.createWithRefreshToken({
    refresh_token: token.refresh_token!,
});
```

## Introspection & revocation

```typescript
const claims = await client.token.introspect({ token: token.access_token });
await client.token.revoke({ token: token.access_token });
```

## Userinfo

`userInfo.get()` accepts a bearer token string, a full header string, or an [`AuthorizationHeader`](/guide/headers#the-authorizationheader-type) descriptor:

```typescript
const profile = await client.userInfo.get(token.access_token);
// { sub, name, email, … }
```

## OpenID Connect discovery

Skip hand-wiring endpoints: fetch the provider's `.well-known/openid-configuration` and build a client from it.

```typescript
import {
    buildOpenIDDiscoveryURL,
    createClientWithOpenIDDiscoveryURL,
} from '@hapic/oauth2';

const discoveryUrl = buildOpenIDDiscoveryURL('https://auth.example.com');
// → https://auth.example.com/.well-known/openid-configuration

const client = await createClientWithOpenIDDiscoveryURL(discoveryUrl);
// authorization / token / userinfo / introspection / revocation endpoints
// are populated from the provider metadata

const token = await client.token.createWithClientCredentials();
```
