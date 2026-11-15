<p align="center">
    <img src="./assets/logo.svg" alt="@hapic/oauth2 logo: a key" width="120" />
</p>

<h1 align="center">@hapic/oauth2</h1>

<p align="center">
    <b>An OAuth2 and OpenID Connect client: authorize URLs, token grants, device authorization, introspection, revocation and userinfo.</b><br>
    You stop hand-building query strings, form bodies and client authentication headers,<br>
    and the authorize URL never carries a secret, whatever object you pass.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hapic/oauth2"><img src="https://img.shields.io/npm/v/@hapic/oauth2" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net/packages/oauth2"><b>Documentation</b></a>
    ·
    <a href="#configuration">Configuration</a>
    ·
    <a href="#authorization-url">Authorization URL</a>
    ·
    <a href="#token-grants">Token grants</a>
    ·
    <a href="#device-authorization">Device authorization</a>
    ·
    <a href="#openid-connect-discovery">Discovery</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why @hapic/oauth2?

Talking to an OAuth2 server with plain `fetch` means the same chores in every project: encode an authorize URL, post a form-encoded body per grant, decide whether the client id and secret go into the body or into a Basic header, keep an app-wide bearer token out of the token request, and copy endpoint URLs out of the provider's discovery document. Each of these is easy to get slightly wrong, and some mistakes leak secrets.

`@hapic/oauth2` does that work on top of the [`hapic`](https://www.npmjs.com/package/hapic) client:

| Concern | Without it | With @hapic/oauth2 |
|---|---|---|
| **Authorize URL** | You concatenate and encode the query yourself; a shared parameters object can put `client_secret` or `code_verifier` into a URL the browser keeps in its history. | `authorize.buildURL()` takes typed OAuth2, PKCE and OpenID Connect parameters, fills `client_id`, `redirect_uri` and `scope` from the client options, and never writes token request credentials to the URL. |
| **Token grants** | One `URLSearchParams` body per grant, `Content-Type` set by hand, the client credentials added to each call. | One method per grant (`createWithClientCredentials`, `createWithPassword`, `createWithAuthorizationCode`, `createWithRefreshToken`, `createWithDeviceCode`, `createWithRobotCredentials`) that sends a form body with the configured credentials, and `pollWithDeviceCode` for the device flow (RFC 8628). |
| **Client authentication** | You pick body or Basic header per provider and implement both. | Body by default; `clientCredentialsAsHeader: true` moves the id and secret to a Basic header and out of the body. |
| **Stray authorization header** | A bearer token set on your HTTP client for API calls is also sent to the token endpoint. | Token, introspection, revocation and device authorization requests drop the client's `Authorization` header unless you opt in with `authorizationHeaderInherit`. |
| **Endpoints** | You copy URLs from the provider's documentation or parse `.well-known/openid-configuration` yourself. | `createClientWithOpenIDDiscoveryURL()` fetches the metadata and returns a configured client. |
| **Failures** | You check `response.ok` and parse the error body. | A 4xx/5xx rejects with an `HttpResponseError` that carries the response; guards such as `isClientErrorWithStatusCode` are exported. |

The same client credentials grant, twice:

```typescript
// with fetch
const response = await fetch('https://auth.example.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'my-app',
        client_secret: 'secret',
        scope: 'api:read',
    }),
});
if (!response.ok) {
    throw new Error(`token request failed: ${response.status}`);
}
const token = await response.json();
```

```typescript
// with @hapic/oauth2
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    options: {
        tokenEndpoint: 'https://auth.example.com/oauth/token',
        clientId: 'my-app',
        clientSecret: 'secret',
        scope: 'api:read',
    },
});

const token = await client.token.createWithClientCredentials();
// { access_token: '…', expires_in: 3600, token_type: 'Bearer' }
```

**Table of Contents**
- [Installation](#installation)
- [Configuration](#configuration)
- [Authorization URL](#authorization-url)
- [Token grants](#token-grants)
- [Client authentication](#client-authentication)
- [Refresh, introspect and revoke](#refresh-introspect-and-revoke)
- [Device authorization](#device-authorization)
- [Userinfo](#userinfo)
- [OpenID Connect discovery](#openid-connect-discovery)
- [Instances](#instances)
- [Errors](#errors)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @hapic/oauth2 hapic --save
```

- ESM only (`import`), with type declarations. There is no CommonJS build.
- Node.js `>=22.0.0`. It also runs in browsers and workers, because requests go through `fetch`.
- `hapic` is a peer dependency: install it next to this package. `OAuth2Client` extends its `Client`, so hooks, headers, transports and the `timeout` option work as described in the [hapic guide](https://hapic.tada5hi.net/guide/).

## Configuration

`OAuth2Client` takes a `request` block, the options of the base `hapic` client, and an `options` block with your client registration and the provider's endpoints.

```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'https://auth.example.com/',
        timeout: 10_000,
    },
    options: {
        clientId: 'my-app',
        clientSecret: 'secret',
        redirectUri: 'https://app.example.com/callback',
        scope: ['openid', 'profile', 'email'],
        authorizationEndpoint: 'https://auth.example.com/oauth/authorize',
        tokenEndpoint: '/oauth/token',
        userinfoEndpoint: '/oauth/userinfo',
    },
});
```

| Option | Type | Default | Used for |
|---|---|---|---|
| `clientId` | `string` | | `client_id` of the authorize URL and of token requests |
| `clientSecret` | `string` | | `client_secret` of token requests (body, or Basic header with `clientCredentialsAsHeader`) |
| `redirectUri` | `string` | | `redirect_uri` of the authorize URL and of the authorization code grant |
| `scope` | `string \| string[]` | | `scope` of the authorize URL, of the device authorization request and of the client credentials, password and refresh token grants |
| `realmId` | `string` | | Sent as `realm_id` in the body of `token.create*` and `deviceAuthorization.create` requests (a non-standard parameter for servers with realms) |
| `authorizationEndpoint` | `string` | `authorize`, resolved against `baseURL` | `authorize.buildURL()`. Must be an absolute URL |
| `tokenEndpoint` | `string` | `/token` | `token.create*` |
| `introspectionEndpoint` | `string` | `/token/introspect` | `token.introspect` |
| `revocationEndpoint` | `string` | `/token/revoke` | `token.revoke` |
| `userinfoEndpoint` | `string` | `/userinfo` | `userInfo.get` |
| `deviceAuthorizationEndpoint` | `string` | `/device_authorization` | `deviceAuthorization.create` |

- The token, introspection, revocation, userinfo and device authorization endpoints may be absolute or relative. A relative one is appended to `baseURL`, path included: `/token` with `baseURL: 'https://auth.example.com/api/'` becomes `https://auth.example.com/api/token`.
- The authorization endpoint is different, because the URL is built rather than requested: set `authorizationEndpoint` to an absolute URL. Without it, `authorize` is resolved against `baseURL` like a link, so `https://auth.example.com/api/` gives `…/api/authorize` but `https://auth.example.com/api` gives `…/authorize`. A relative `authorizationEndpoint`, or neither option, makes `buildURL()` throw a `TypeError` (`Invalid URL`).
- `client.options` is one object shared by `client.authorize`, `client.token`, `client.userInfo` and `client.deviceAuthorization`. Changing a property later (`client.options.clientId = 'other'`) affects all of them.

## Authorization URL

`authorize.buildURL()` returns the URL you redirect the browser to. It fills `client_id`, `redirect_uri` and `scope` from the client options when you leave them out and sets `response_type=code` by default.

```typescript
import { createHash, randomBytes } from 'node:crypto';

// PKCE: you create the verifier and its challenge, the client only transports them
const codeVerifier = randomBytes(32).toString('base64url');
const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

const url = client.authorize.buildURL({
    state: 'af0ifjsldkj',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce: 'n-0S6_WzA2Mj',
    prompt: ['login', 'consent'],
    max_age: 0,
    audience: 'https://api.example.com',
});
// https://auth.example.com/oauth/authorize?response_type=code&client_id=my-app
//     &redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&scope=openid+profile+email
//     &state=af0ifjsldkj&code_challenge=…&code_challenge_method=S256&nonce=n-0S6_WzA2Mj
//     &prompt=login+consent&max_age=0&audience=https%3A%2F%2Fapi.example.com
```

<p align="center">
    <img src="./assets/authorization-code.svg" alt="Sequence of the authorization code flow with PKCE. 1: your app creates a code verifier and its S256 challenge and calls authorize.buildURL with the state and the code challenge. 2 and 3: the browser is redirected to the authorization endpoint with response_type, client_id, redirect_uri, scope, state and code_challenge in the URL, and the user signs in. 4 and 5: the server redirects back to redirect_uri with a code and the state, and your app checks the state. 6: your app calls token.createWithAuthorizationCode with the code and the code verifier, which posts a form body with the client id and secret to the token endpoint, or sends them in a Basic header with clientCredentialsAsHeader. 7: the server answers with the access token and optionally a refresh token and an ID token. The client secret, client assertion, code verifier, password and refresh token are never written to the authorize URL." width="100%" />
</p>

Typed parameters (`AuthorizeParameters`):

| Parameter | Type | Source |
|---|---|---|
| `response_type` | `'code' \| 'token' \| 'id_token' \| 'none'`, or an array of them | OAuth2; default `code` |
| `client_id`, `redirect_uri` | `string` | OAuth2; default `options.clientId`, `options.redirectUri` |
| `scope` | `string \| string[]` | OAuth2; default `options.scope` |
| `state` | `string` | OAuth2 |
| `response_mode` | `'query' \| 'fragment' \| 'form_post' \| 'web_message'` | OAuth2 response modes |
| `code_challenge`, `code_challenge_method` | `string`, `'S256' \| 'plain'` | PKCE (RFC 7636) |
| `nonce`, `id_token_hint`, `login_hint` | `string` | OpenID Connect |
| `display` | `'page' \| 'popup' \| 'touch' \| 'wap'` | OpenID Connect |
| `prompt` | `'none' \| 'login' \| 'consent' \| 'select_account'`, or an array of them | OpenID Connect |
| `max_age` | `number \| string` | OpenID Connect, seconds |
| `ui_locales`, `acr_values` | `string \| string[]` | OpenID Connect |

The enums `AuthorizeResponseType`, `AuthorizeResponseMode`, `AuthorizeCodeChallengeMethod`, `AuthorizeDisplay` and `AuthorizePrompt` hold the same values.

Rules:

- **Typed parameters** are written first, in a fixed order. An array is joined with spaces (duplicates removed), a number is turned into a string, and an empty value (`''`, `null`, `undefined`, an empty array) is left out.
- **Any other key** is a custom parameter (`audience`, `resource`, a provider extension) and is appended after the typed ones in input order. An array repeats the parameter once per item, so `resource: ['https://a.example.com', 'https://b.example.com']` gives two `resource` parameters (RFC 8707).
- **A custom parameter replaces** a parameter of the same name the endpoint URL already carries: `authorizationEndpoint: 'https://auth.example.com/authorize?audience=default'` with `audience: 'api'` ends with one `audience=api`.
- **Credentials are never written**: `client_secret`, `client_assertion`, `code_verifier`, `password` and `refresh_token` are dropped even when the object carries them, because the browser keeps the URL in its address bar and history and it can end up in referrers and server logs. Pass a dedicated object to `buildURL()` anyway; the token methods add the client secret to the object you give them (see [Notes](#notes)).
- `buildAuthorizeURL(endpoint, parameters)` is the same function without a client: it applies the same rules and the `response_type=code` default, but does not read client options. `endpoint` must be an absolute URL.

```typescript
import { buildAuthorizeURL } from '@hapic/oauth2';

const url = buildAuthorizeURL('https://auth.example.com/oauth/authorize', {
    client_id: 'my-app',
    redirect_uri: 'https://app.example.com/callback',
    resource: ['https://a.example.com', 'https://b.example.com'],
});
```

## Token grants

Each grant has a method that posts a form-encoded body to `tokenEndpoint` and resolves with a `TokenGrantResponse`.

```typescript
// service to service
let token = await client.token.createWithClientCredentials({ scope: 'api:read' });

// resource owner password
token = await client.token.createWithPassword({
    username: 'admin',
    password: 'start123',
});

// authorization code, in the callback handler (PKCE: pass the verifier from above)
token = await client.token.createWithAuthorizationCode({
    code: 'SplxlOBeZQQYbYS6WxSbIA',
    code_verifier: codeVerifier,
});

// refresh
token = await client.token.createWithRefreshToken({
    refresh_token: 'tGzv3JOkF0XG5Qx2TlKWIA',
});

// robot credentials (grant_type=robot_credentials, non-standard)
token = await client.token.createWithRobotCredentials({
    id: 'system',
    secret: 'start123',
});

console.log(token);
// { access_token: '…', expires_in: 3600, token_type: 'Bearer', refresh_token: '…' }
```

| Method | `grant_type` | Parameters | Filled from the options when missing |
|---|---|---|---|
| `createWithClientCredentials(parameters?)` | `client_credentials` | `scope?` | `scope`, `client_id`, `client_secret`, `realm_id` |
| `createWithPassword(parameters)` | `password` | `username`, `password`, `scope?` | `scope`, `client_id`, `client_secret`, `realm_id` |
| `createWithAuthorizationCode(parameters)` | `authorization_code` | `code`, `code_verifier?`, `redirect_uri?` | `redirect_uri`, `client_id`, `client_secret`, `realm_id` |
| `createWithRefreshToken(parameters)` | `refresh_token` | `refresh_token`, `scope?` | `scope`, `client_id`, `client_secret`, `realm_id` |
| `createWithDeviceCode(parameters)` | `urn:ietf:params:oauth:grant-type:device_code` | `device_code` | `client_id`, `client_secret`, `realm_id` |
| `createWithRobotCredentials(parameters)` | `robot_credentials` | `id`, `secret` | `client_id`, `client_secret`, `realm_id` |
| `create(parameters)` | from `parameters.grant_type` | any of the above, with `grant_type` | as for that grant |

- Every method also accepts `client_id`, `client_secret` and `realm_id` in the parameters. When you pass `client_id`, the configured id and secret are not added to the body; a `client_secret` without a `client_id` is replaced by the configured pair.
- String values are written to the body, arrays are joined with spaces (`scope: ['a', 'b']` gives `scope=a b`), and empty or non-string values are left out.
- The response keeps `access_token`, `expires_in`, `token_type` (`Bearer` when the server sends none) and, when present, `refresh_token`, `refresh_token_expires_in`, `id_token`, `mac_key` and `mac_algorithm`. Every other field, including `scope`, is dropped.

## Client authentication

The second argument of every token method (`create*`, `pollWithDeviceCode`, `introspect`, `revoke`) and of `deviceAuthorization.create` controls how the request is authenticated:

```typescript
// client id and secret in a Basic header instead of the body
token = await client.token.createWithClientCredentials({}, {
    clientCredentialsAsHeader: true,
});

// a different client for this request only
token = await client.token.createWithClientCredentials({}, {
    clientId: 'other-app',
    clientSecret: 'other-secret',
    clientCredentialsAsHeader: true,
});

// an explicit Authorization header (string or AuthorizationHeader object)
token = await client.token.createWithPassword(
    { username: 'admin', password: 'start123' },
    { authorizationHeader: { type: 'Basic', username: 'my-app', password: 'secret' } },
);

// abort or time out a single request
const controller = new AbortController();
token = await client.token.createWithClientCredentials({}, {
    signal: controller.signal,
    timeout: 5_000,
});
```

| Option (`TokenBaseOptions`) | Type | Default | Description |
|---|---|---|---|
| `clientCredentialsAsHeader` | `boolean` | `false` | Send the client id and secret as `Authorization: Basic …` and remove `client_id` and `client_secret` from the body |
| `clientId`, `clientSecret` | `string` | `options.clientId`, `options.clientSecret` | The credentials for that header, for this request only. Without `clientCredentialsAsHeader` they are not sent |
| `realmId` | `string` | `options.realmId` | Realm for this request |
| `authorizationHeader` | `string \| AuthorizationHeader` | | Use this `Authorization` header. Takes precedence over `clientCredentialsAsHeader` |
| `authorizationHeaderInherit` | `boolean` | `false` | Keep the client's own `Authorization` header (set with `setAuthorizationHeader`) for this request |
| `signal` | `AbortSignal` | | Abort the request |
| `timeout` | `number` | the client's `timeout` | Abort after this many milliseconds |

Rules:

- The client's own `Authorization` header is removed from every token, introspection, revocation and device authorization request, unless `authorizationHeaderInherit` is set and the header exists.
- Otherwise `authorizationHeader` wins, then the Basic header of `clientCredentialsAsHeader` (when both an id and a secret are known). Without either, the request carries no `Authorization` header and the credentials, if any, travel in the body.
- Every request is sent with `Content-Type: application/x-www-form-urlencoded` and `Accept: application/json`.
- A request that hits its `timeout` rejects with a `NetworkError` whose `code` is `ETIMEDOUT`; test for it with `isClientErrorDueTimeout` from `hapic`.

## Refresh, introspect and revoke

```typescript
// a new access token from a refresh token
const refreshed = await client.token.createWithRefreshToken({
    refresh_token: token.refresh_token!,
});

// RFC 7662: resolves with the response body
const claims = await client.token.introspect(
    { token: refreshed.access_token, token_type_hint: 'access_token' },
    { clientCredentialsAsHeader: true },
);
// { active: true, sub: '…', exp: 1735689600, … }

// RFC 7009: resolves with the hapic Response
await client.token.revoke(
    { token: refreshed.refresh_token, token_type_hint: 'refresh_token' },
    { clientCredentialsAsHeader: true },
);
```

- `introspect<T>()` posts to `introspectionEndpoint` and resolves with the response body, typed as `JwtPayload` unless you pass `T`.
- `revoke()` posts to `revocationEndpoint` and resolves with the `hapic` `Response`; servers usually answer with an empty 200.
- **The configured client credentials are not added to these two requests.** Authenticate them with `clientCredentialsAsHeader: true` (uses `options.clientId` and `options.clientSecret`), with `client_id` and `client_secret` in the parameters (sent in the body), with `authorizationHeader`, or with `authorizationHeaderInherit` and a header set on the client:

```typescript
client.setAuthorizationHeader({ type: 'Bearer', token: 'service-token' });

await client.token.introspect(
    { token: 'token-to-check' },
    { authorizationHeaderInherit: true },
);
```

## Device authorization

For a device without a browser or keyboard (a CLI, a TV, a printer), RFC 8628 replaces the redirect: the device requests a user code, the user enters it on another device, and the device polls the token endpoint until the user has approved.

```typescript
// 1. request a device code and a user code
const authorization = await client.deviceAuthorization.create({ scope: 'openid profile' });

// 2. show the user where to go and what to enter
console.log(`Open ${authorization.verification_uri} and enter ${authorization.user_code}`);
// or render authorization.verification_uri_complete as a QR code

// 3. poll the token endpoint until the user has approved
const controller = new AbortController();
const token = await client.token.pollWithDeviceCode(authorization, {
    signal: controller.signal,
});
```

- `deviceAuthorization.create(parameters?, options?)` posts a form body to `deviceAuthorizationEndpoint` and fills `client_id`, `client_secret`, `realm_id` and `scope` from the client options when you leave them out. It follows the [client authentication](#client-authentication) rules of the token methods. It resolves with `device_code`, `user_code`, `verification_uri`, `expires_in` and, when present, `verification_uri_complete` and `interval`.
- `token.pollWithDeviceCode(parameters, options?)` waits `interval` seconds (5 when unset), then calls `createWithDeviceCode`, and repeats while the server answers `authorization_pending`. A `slow_down` adds 5 seconds to the interval for this and every later request. Any other error, such as `access_denied` or `expired_token`, rejects as is.
- You can pass the device authorization response as it is: only `device_code`, `client_id`, `client_secret` and `realm_id` are sent. With `expires_in`, polling stops once the next wait would end after that many seconds from the start of the call, and rejects with the last `authorization_pending` or `slow_down` error. At least one request is always made.
- Aborting `signal` during a wait rejects with its `reason`; during a request it rejects with the client's abort error (`NetworkError`). `timeout` applies to each request, not to the whole polling.
- `createWithDeviceCode({ device_code })` makes a single request, for your own polling loop. No `scope` is sent with the device code grant.

## Userinfo

```typescript
// a bare token gets the Bearer prefix
let profile = await client.userInfo.get('eyJhbGciOi…');

// a string with a space is sent as is
profile = await client.userInfo.get('Bearer eyJhbGciOi…');

// an AuthorizationHeader object
profile = await client.userInfo.get({ type: 'Bearer', token: 'eyJhbGciOi…' });

// no argument: the Authorization header set on the client
client.setAuthorizationHeader({ type: 'Bearer', token: 'eyJhbGciOi…' });
profile = await client.userInfo.get();
// { sub: '…', name: '…', email: '…' }
```

`userInfo.get<T>()` sends a GET to `userinfoEndpoint` with `Accept: application/json` and resolves with the response body.

A second argument bounds or cancels the request:

```typescript
const controller = new AbortController();

profile = await client.userInfo.get('eyJhbGciOi…', {
    signal: controller.signal,
    timeout: 5_000,
});
```

| Option (`UserInfoOptions`) | Type | Default | Description |
|---|---|---|---|
| `signal` | `AbortSignal` | | Abort the request |
| `timeout` | `number` | the client's `timeout` | Abort after this many milliseconds |

## OpenID Connect discovery

`createClientWithOpenIDDiscoveryURL()` requests the provider metadata and returns an `OAuth2Client` whose `authorizationEndpoint`, `tokenEndpoint`, `introspectionEndpoint`, `revocationEndpoint`, `userinfoEndpoint` and `deviceAuthorizationEndpoint` come from it.

```typescript
import {
    buildOpenIDDiscoveryURL,
    createClientWithOpenIDDiscoveryURL,
} from '@hapic/oauth2';

const discoveryURL = buildOpenIDDiscoveryURL('https://auth.example.com/realms/master/');
// https://auth.example.com/realms/master/.well-known/openid-configuration

const discovered = await createClientWithOpenIDDiscoveryURL(discoveryURL, {
    timeout: 10_000,
});

// the metadata has no client registration: add yours
discovered.options.clientId = 'my-app';
discovered.options.clientSecret = 'secret';

const serviceToken = await discovered.token.createWithClientCredentials();
```

The second argument is either client options or an existing client:

- **Client options** (`baseURL`, `headers`, `transport`, `timeout`, …) configure the discovery request and become the `request` options of the returned client.
- **A client** (a `hapic` `Client` or any service client): the discovery request is sent with it, so its hooks run for that one request. The returned client is built from `client.toOptions()`: its defaults, its current headers (including an `Authorization` header) and the same transport instance. **Its hooks are not carried over**, because hooks belong to a client instance; register them on the returned client.
- A client of an older `hapic` copy without `toOptions()` falls back to its `defaults` plus its current `Authorization` header.
- Only these endpoints are copied. `clientId`, `clientSecret`, `redirectUri` and `scope` stay unset, and `issuer` and `jwks_uri` are not used: the client does not validate ID tokens.
- `buildOpenIDDiscoveryURL(baseURL)` resolves `.well-known/openid-configuration` against `baseURL` like a link: keep a trailing slash to keep the last path segment (`…/realms/master` without the slash gives `…/realms/.well-known/…`). Without an argument it returns `/.well-known/openid-configuration`.
- `parseOpenIDProviderMetadata(metadata)` turns metadata you already have into the `options` block.

## Instances

The package keeps a registry of clients, keyed by name (`'default'` when you pass none):

```typescript
import { OAuth2Client, isClient, setClient, useClient } from '@hapic/oauth2';

setClient(new OAuth2Client({ options: { clientId: 'my-app' } }));

// anywhere else in your code
const shared = useClient();

isClient(shared); // true
```

| Function | Description |
|---|---|
| `createClient(input?)` | Create a new `OAuth2Client`. It is not registered |
| `setClient(client, key?)` | Register a client under `key` and return it |
| `useClient(key?)` | Return the client registered under `key`, or create one without configuration, register it and return it |
| `hasClient(key?)` / `unsetClient(key?)` | Check for or remove a registered client |
| `isClient(input)` | `true` for an `OAuth2Client`, also one from another copy of the package (marker `Symbol.for('@hapic/oauth2/OAuth2Client')`) |

The default export is a separate `OAuth2Client` created without configuration; it is not the one `useClient()` returns. More on the registry: [Instance Registry](https://hapic.tada5hi.net/guide/instance).

## Errors

A response with a status of 400 to 599 rejects with an `HttpResponseError`; a request that never got a response (network failure, abort, timeout) rejects with a `NetworkError`. Both are `ClientError`s.

```typescript
import { isClientErrorWithStatusCode, isHttpResponseError } from '@hapic/oauth2';

try {
    await client.token.createWithRefreshToken({ refresh_token: 'expired' });
} catch (error) {
    if (isHttpResponseError(error)) {
        // RFC 6749 5.2: { error: 'invalid_grant', error_description?: '…' }
        console.log(error.status, error.response?.data);
    }

    if (isClientErrorWithStatusCode(error, [400, 401])) {
        // send the user through the authorization flow again
    }
}
```

| Guard | Matches |
|---|---|
| `isHapicError` | Any error thrown by `hapic` or a `@hapic/*` package |
| `isClientError` | Any request error (`HttpResponseError` or `NetworkError`) |
| `isHttpResponseError` | A 4xx/5xx response; `error.response.data` holds the decoded body |
| `isNetworkError` | No response at all |
| `isClientErrorWithStatusCode(error, code \| code[])` | A response with one of these status codes |
| `isClientErrorDueNetworkIssue` | A request error without a response, except an abort |

`buildURL()` and `buildAuthorizeURL()` throw a plain `TypeError` for an endpoint that is not an absolute URL. More on errors, and on error hooks that retry a request: [Errors](https://hapic.tada5hi.net/guide/errors).

## API

| Export | Kind | Purpose |
|---|---|---|
| `OAuth2Client` | class | Client with `authorize`, `token`, `userInfo`, `deviceAuthorization` and `options` |
| `AuthorizeAPI` | class | `buildURL(parameters?)` |
| `TokenAPI` | class | `create`, `createWithClientCredentials`, `createWithPassword`, `createWithAuthorizationCode`, `createWithRefreshToken`, `createWithDeviceCode`, `createWithRobotCredentials`, `pollWithDeviceCode`, `introspect`, `revoke` |
| `DeviceAuthorizationAPI` | class | `create(parameters?, options?)` |
| `UserInfoAPI` | class | `get(header?, options?)` |
| `buildAuthorizeURL` | function | Authorize URL from an endpoint and parameters |
| `createClientWithOpenIDDiscoveryURL` | function | Client from a discovery document |
| `buildOpenIDDiscoveryURL` | function | `.well-known/openid-configuration` URL for a base URL |
| `parseOpenIDProviderMetadata` | function | Provider metadata to `Options` |
| `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` | functions | [Instances](#instances) |
| `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue` | functions | [Errors](#errors), re-exported from `hapic` |
| `transformHeadersForTokenAPIRequest(headers, options?)` | function | Apply the token request header rules to a `Headers` object: set `Content-Type: application/x-www-form-urlencoded`, drop the client's `Authorization` header unless `authorizationHeaderInherit`, then set `authorizationHeader`, or the client credentials as Basic with `clientCredentialsAsHeader` (see [Client authentication](#client-authentication)) |
| `createRequestTransformerForTokenAPIRequest(parameters, options?)` | function | A `hapic` request transformer that applies the same header rules and, with `clientCredentialsAsHeader`, removes `client_id` and `client_secret` from the body. Use it for a custom request to an endpoint of the authorization server |
| `buildRequestTransformersForTokenAPIRequest(client, defaults, parameters, options?)` | function | The transformers of a token style request: the header rules first, then the client's default transformers. Fills `clientId`, `clientSecret` and `realmId` of `options` from `defaults` |
| `buildRequestOptionsForTokenAPIRequest(transform, options?)` | function | Request options with the transformers, `Accept: application/json`, and the `signal` and `timeout` of `options` |
| `buildURLSearchParamsForTokenAPIRequest(input)` | function | A form body: non empty strings as is, arrays joined with spaces, everything else left out |
| `extendClientAuthenticationParameters(parameters, defaults)` | function | Fill `client_id`, `client_secret` and `realm_id` of `parameters` from the client options |
| `scopeToArray`, `scopeToString` | functions | Convert a scope between `'a b'` and `['a', 'b']` (`scopeToString` removes duplicates) |
| `AuthorizeResponseType`, `AuthorizeResponseMode`, `AuthorizeCodeChallengeMethod`, `AuthorizeDisplay`, `AuthorizePrompt`, `ResponseType` | enums | Parameter values |
| `Options`, `Config`, `ConfigInput` | types | Client configuration |
| `AuthorizeParameters`, `AuthorizeParameterValue` | types | Authorize URL parameters |
| `TokenGrantParameters`, `Token*GrantParameters`, `TokenGrantResponse`, `TokenBaseOptions`, `TokenIntrospectParameters`, `TokenRevokeParameters`, `TokenDeviceCodePollParameters`, `ClientAuthenticationParameters` | types | Token requests |
| `DeviceAuthorizationParameters`, `DeviceAuthorizationResponse` | types | Device authorization requests |
| `UserInfoOptions` | type | Userinfo request options |
| `OpenIDProviderMetadata`, `JwtPayload`, `ResponseTypeCombinations` | types | Discovery and token payloads |
| default export | `OAuth2Client` | An unconfigured client, not the registry's `'default'` |

## Notes

- **`AuthorizeParameters` has an index signature** for custom parameters. An object typed with an `interface` has no implicit index signature and is not assignable to it, and neither is a type with a non-string extra property. Use a `type` alias, build the object inline, or spread it (`buildURL({ ...parameters })`). The index signature also means a misspelt key (`redirect_url`) is not a type error: it is sent as a custom parameter.
- **The token methods change the objects you pass.** `create*` writes `client_id`, `client_secret`, `scope`, `redirect_uri` and `realm_id` from the client options into your parameters object, and every token method stores the resolved `clientId`, `clientSecret` and `realmId` in your per-request options object. `deviceAuthorization.create` does the same; `pollWithDeviceCode` works on copies. Pass fresh objects, and never reuse a token parameters object for `buildURL()`.
- **Introspection and revocation do not send the configured client credentials by themselves.** Set `clientCredentialsAsHeader: true`, pass `client_id` and `client_secret`, or set an `Authorization` header (see [Refresh, introspect and revoke](#refresh-introspect-and-revoke)).
- **`clientId` and `clientSecret` in the per-request options only take effect with `clientCredentialsAsHeader: true`.** Without it they are not sent; put `client_id` and `client_secret` in the parameters to send them in the body.
- **`authorizationEndpoint` must be absolute.** A relative value throws a `TypeError` in `buildURL()`, while the other endpoints may be relative to `baseURL`.
- **The token response is reduced** to the fields listed under [Token grants](#token-grants). A `scope` the server returns is not passed on.
- **No PKCE generation and no ID token validation.** The client sends the `code_challenge` and `code_verifier` you create and returns the `id_token` as a string. Check `state` and verify ID tokens in your code.
- **Discovery does not copy hooks.** A client passed to `createClientWithOpenIDDiscoveryURL()` lends its options, headers and transport, not its hooks.

## Contributing

Bug reports and pull requests are welcome in the [hapic repository](https://github.com/tada5hi/hapic). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/); run `npm run build`, `npm run test` and `npm run lint` before you open a pull request.

## License

Made with 💚

Published under [MIT License](./LICENSE).
