# HAPIC 🚀

[![npm version](https://badge.fury.io/js/hapic.svg)](https://badge.fury.io/js/hapic)
[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

"**H**TTP **API** **C**lient" is a tiny & simple fetch based http client.
It provides a convenient way to make HTTP requests.

## Features

- ✨ Simple API
- 🔄 Transform request payload & headers
- 🛑 Hooks to intercept request and response
- 🌐 Works in Node.Js, browser & workers environment
- ❌ Throws an error on responses with a non 2xx status code
- 🚀 Method shortcuts for GET, POST, PUT, ...
- ⚙️ Extended options (e.g. baseURL)

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [Singleton](#singleton)
  - [Request](#request)
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

```typescript
import { Client } from "hapic";

const client = new Client({
    baseURL: 'http://localhost:3000/',
    credentials: 'include',
});
```

### Singleton

A singleton instance can be associated to a key, to handle multiple singleton instances.

**`Registration`**
```typescript
import { Client, setClient } from "hapic";

const client = new Client({
    //...
});

// This will register the client for the key "default",
// which is also the default key.
setClient(client, 'default');

```

**`Access`**
```typescript
import { useClient } from 'hapic';

const client = useClient('default');

// do something with the client
```

### Request

**`DELETE`**
```typescript
import client from 'hapic';

const { data } = await client.delete('users/1');
console.log(data);
// [{ id: 1, name: 'xxx' }]
```

**`GET`**
```typescript
import client from 'hapic';

let { data } = await client.get('users');
console.log(data);
// [{ id: 2, name: 'Peter' }]
```

**`PATCH`**
```typescript
import client from 'hapic';

let { data } = await client.patch('users/2', { name: 'Peter P.' });
console.log(data);
// [{ id: 2, name: 'Peter P.' }]
```

**`POST`**
```typescript
import client from 'hapic';

let { data } = await client.post('users', { name: 'Hans' });
console.log(data);
// [{ id: 3, name: 'Hans' }]
```

**`PUT`**
```typescript
import client from 'hapic';

let { data } = await client.put('users/3', { id: 3, name: 'Hans' });
console.log(data);
// [{ id: 3, name: 'Hans' }]
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
