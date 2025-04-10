# @hapic/oauth2 🛡️

[![npm version](https://badge.fury.io/js/@hapic%2Foauth2.svg)](https://badge.fury.io/js/@hapic%2Foauth2)
[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This client provides an easy way to authenticate and authorize **users**, **clients**, **robots**, ...
using OAuth2 and OpenID Connect standards.
With this API client, developers can easily interact with the server's endpoints,
such as authentication flows, token issuance, and user management.
The client offers a range of abstractions to simplify interactions with the server
and speed up the development process.
Whether you are an experienced developer or new to OAuth2/OpenID,
this API client is a powerful tool to help you implement secure **users**, **clients** & **robots** authentication
and authorization in your applications.

**Table of Contents**

- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
  - [Authorize](#authorize)
  - [Token](#token)
  - [UserInfo](#userInfo)
- [License](#license)

## Documentation

To read the docs, visit [https://hapic.tada5hi.net](https://hapic.tada5hi.net)

## Installation

```bash
npm install @hapic/oauth2 --save
```

## Usage

### Authorize
**`URL`**
```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'http://localhost:3000/',
    },
    options: {
        /**
         * default: /authorize
         */
        authorizationEndpoint: 'https://example.com/authorize'
    }
});

const authorizeUrl = client.authorize.buildURL({
    client_id: 'client',
    /**
     * Relative or absolute url.
     */
    redirect_uri: 'http://localhost:3000/redirect-callback'
});

console.log(authorizeUrl);
// https://example.com/authorize?
//     response_type=code&
//     client_id=client&
//     redirect_uri=http://localhost:3000/redirect-callback
```
### Token

**`Create`**
```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'http://localhost:3000/'
    },
    options: {
        /**
         * default: /token
         */
        tokenEndpoint: 'https://example.com/authorize',
        clientId: 'client',
        clientSecret: 'secret',
    }
});

let token = await client.token.createWithRefreshTokenGrant({
    refresh_token: 'refresh_token'
});

token = await client.token.createWithClientCredentialsGrant({
    // optional, if defined globally
    client_id: 'foo',
    client_secret: 'bar',
});

token = await client.token.createWithPasswordGrant({
    username: 'admin',
    password: 'start123'
});

token = await client.token.createWithAuthorizationCodeGrant({
    state: 'state',
    code: 'code'
});

token = await client.token.createWithRobotCredentialsGrant({
    id: 'system',
    secret: 'start123'
});

console.log(token);
// { token_type: 'Bearer', access_token: 'xxx', refres_token: 'xxx', ...}
```

**`Introspect`**
```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'http://localhost:3000/'
    },
    options: {
        /**
         * default: /token/introspect
         */
        introspectionEndpoint: 'https://example.com/token/introspect'
    }
});

let token = await client.token.introspect({
    token: 'xxx',
    // token_type_hint: 'xxx',
});

// authorize introspection request with custom header
token = await client.token.introspect(
    {
        token: 'xxx',
        // token_type_hint: 'xxx'
    },
    {
        authorizationHeader: 'xxx',
    }
)

// authorize introspection request with existing client token.
token = await client.token.introspect(
    {
        token: 'xxx',
        // token_type_hint: 'xxx'
    },
    {
        authorizationHeaderInherit: true,
    }
)

// authorize introspection request with client credentials
token = await client.token.introspect(
    {
        token: 'xxx',
        client_id: 'client',
        client_secret: 'secret'
    }
)

// authorize introspection request with client credentials header
token = await client.token.introspect(
    {
        token: 'xxx'
    },
    {
        clientId: 'client',
        clientSecret: 'secret'
    }
);

console.log(token);
// { active: true, ... }
```

### UserInfo

```typescript
import { OAuth2Client } from '@hapic/oauth2';

const client = new OAuth2Client({
    request: {
        baseURL: 'http://localhost:3000/'
    },
    options: {
        /**
         * default: /userinfo
         */
        userInfoEndpoint: 'https://example.com/users/@me'
    }
});

// authenticate by authorization string
let userInfo = await client.userInfo.get('Bearer xxx');

// authenticate by authorization object configuration
userInfo = await client.userInfo.get({
    type: 'Basic',
    username: 'admin',
    password: 'start123'
});

// authenticate by existing client token
userInfo = await client.userInfo.get();

console.log(userInfo);
// { id: 'xxx', name: 'admin', ...}
```
## License

Made with 💚

Published under [MIT License](./LICENSE).
