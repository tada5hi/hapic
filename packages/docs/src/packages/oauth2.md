---
package:
  name: "@hapic/oauth2"
  summary: "OAuth2 and OpenID Connect client: authorization URLs, every token grant, introspection and userinfo."
  accent: "#818cf8"
  order: 2
---

# @hapic/oauth2

An OAuth2 / OpenID Connect client — build authorization URLs, exchange every grant type for tokens, introspect and revoke them, and fetch userinfo. It extends the base [`Client`](/guide/client) and registers its own cross-realm marker, `Symbol.for('@hapic/oauth2/OAuth2Client')`, alongside the inherited `Client` marker.

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
        // must be an absolute URL: it is built into a link, not requested
        authorizationEndpoint: 'https://auth.example.com/oauth2/authorize',
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

`buildURL` fills `client_id`, `redirect_uri` and `scope` from the client options when omitted and defaults `response_type` to `code`. Besides the OAuth2 parameters (`response_mode`, `state`, `code_challenge`, `code_challenge_method`), it accepts the typed OpenID Connect authentication request parameters `nonce`, `display`, `prompt`, `max_age`, `ui_locales`, `id_token_hint`, `login_hint` and `acr_values`. Any other key (e.g. `audience`, `resource`) is passed through to the URL as well:

```typescript
const url = client.authorize.buildURL({
    scope: ['openid', 'profile'],
    nonce: 'n-0S6_WzA2Mj',
    prompt: ['login', 'consent'], // → prompt=login+consent
    max_age: 0,
    acr_values: 'urn:mace:incommon:iap:silver',
    audience: 'https://api.example.com', // custom parameter
});
```

Array values of the typed parameters are space-joined, an array of any other parameter repeats it once per item (e.g. `resource`, RFC 8707), numbers are stringified, and empty (`''`, `null`, `undefined`) values are skipped. Values of other types are ignored. The same logic is available standalone as `buildAuthorizeURL(endpoint, parameters)`.

Any other key of the parameters object is written to the URL as a custom parameter and replaces a parameter of the same name the endpoint already carries. The credentials of the token request (`client_secret`, `client_assertion`, `code_verifier`, `password`, `refresh_token`) are the exception: the authorize URL is opened in the browser, so they are never written to it. Keep them out of the object anyway, and pass a dedicated parameters object, not one shared with the token request.

::: warning Type change
`AuthorizeParameters` has an index signature for custom parameters. An object typed as an `interface`, or one with a non-string extra property, is no longer assignable; use a `type` alias or build the object inline.
:::

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

The second argument is either client options or an existing client used for the discovery request:

- **Client options** (`baseURL`, `headers`, `transport`, …) configure both the discovery request and the returned client.
- **A client**: the returned client is built from its current configuration (`client.toOptions()`): defaults, headers and transport, where the transport is the same instance. Its hooks are **not** carried over (hooks are bound to a client instance), so register those on the returned client.
