# hapic 🐯

[![npm version](https://badge.fury.io/js/hapic.svg)](https://badge.fury.io/js/hapic)
[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/Tada5hi/hapic/branch/main/graph/badge.svg?token=ZUJ8F5TTSX)](https://codecov.io/gh/Tada5hi/hapic)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This package contains a simple API-Client based on axios.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [Singleton](#singleton)
  - [Header](#header)
- [License](#license)

## Installation

```bash
npm install hapic --save
```

## Usage

### Config

To create a configuration for the  `Client`, a configuration must be specified,
like described in the following:

**Client**

```typescript
import {
    setConfig
} from "hapic";

setConfig({
    driver: {
        baseURL: 'http://localhost:3000/',
        withCredentials: true,
    },
}, 'key')
```

A configuration is always identified by a `key`,
so multiple configurations can be registered. The default key is named: `default`

In the upper example, the **driver** property is used to pass information to the underneath driver (axios).

### Singleton

A singleton instance associated for a given configuration key,
can be acquired like described in the following:

**Client**
```typescript
import {
    useClient
} from "hapic";

const client = useClient('key');
client.setAuthorizationHeader({
    type: 'bearer',
    token: 'xxx'
})

(async () => {
    const {data} = await client.get('users');
    console.log(data);
    // [{id: 1, name: 'Peter'}]
})();
```

### Header

The main purpose of the header utils, is to parse and build HTTP headers.

**AuthorizationHeader**

```typescript
import {
    parseAuthorizationHeader,
    stringifyAuthorizationHeader
} from "hapic";

const basicValue = Buffer
    .from('admin:start123')
    .toString('base64');

const value = parseAuthorizationHeader(`Basic ${basicValue}`);
console.log(value);
// {type: 'Basic', username: 'admin', password: 'start123'}

// -------------------------------------------------

let headerValue = stringifyAuthorizationHeader({
    type: 'Basic',
    username: 'admin',
    password: 'start123'
});
console.log(headerValue);
// Basic xxxxxxx

headerValue = stringifyAuthorizationHeader({
    type: 'Bearer',
    token: 'start123'
});
console.log(headerValue);
// Bearer start123
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
