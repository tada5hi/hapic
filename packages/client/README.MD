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
- 🎭 Proxy support

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [Request](#request)
  - [Hooks](#hooks)
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
    proxy: true
});
```

These are the available configuration options for making requests and creating a client:
The type for the configuration object can be inspected under [src/request/type.ts](./src/request/type.ts).

> [!NOTE]
> The configuration object extends the RequestInit type of the globalThis object.
> This means that these options are also available.

```typescript
export default {
    /**
     * globalThis.RequestInit
     *
     * A Headers object, an object literal, or an array of two-item arrays to set request's headers.
     */
    headers: {
        'Authorization': 'Bearer foo'
    },
    /**
     * globalThis.RequestInit
     *
     * A string indicating whether credentials will be sent with the request always, never,
     * or only when sent to a same-origin URL. Sets request's credentials.
     */
    credentials: 'include',
    /**
     * A string to set request's method.
     */
    method: 'GET',
    /**
     * The base URL for the HTTP endpoints.
     */
    baseURL: 'https://example.com/',
    /**
     * The request body.
     */
    body: {
        foo: 'bar'
    },
    /**
     * The desired response type (json, .
     *
     * default: CONTENT_TYPE header
     */
    responseType: 'json',
    /**
     * A function or array of functions to transform the response data.
     */
    responseTransform: [
        (data) => {
            // transform the data
            return data;
        }
    ],
    /**
     * Query string parameters for the request.
     */
    params: {
        id: 123
    },
    /**
     * Activate or deactivate the use of proxies or enter customized options.
     * By default, https_proxy, http_proxy, HTTPS_PROXY, and HTTP_PROXY environment variables will be checked and used
     *
     * default: true (disable with false)
     */
    proxy: {
        url: 'http://localhost:9080', // overrite env variables
        noProxy: '.foo.bar'
    },
    /**
     * Query string parameters for the request.
     */
    query: {
        id: 123
    },
    /**
     * A function or array of functions to transform the request data.
     */
    transform: [
        (data) => {
            // transform the data
            return data;
        }
    ],
};
```

### Request

For the sake of simplicity, alias names have been provided for all supported request methods.

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

### Hooks

It is possible to intercept requests or responses before and after they are processed.

**Request Hooks**

```typescript
import client, { ClientError, RequestOptions } from 'hapic';

client.on('request', (options: RequestOptions) => {
    // Do something with the request options before the request is sent
    options.transform = (data, headers) => {
        headers.set(HeaderName.AUTHORIZATION, 'Bearer foo');

        return data;
    };

    return options;
});

client.on('requestError', (error: ClientError) => {
    // Do something with the request error
    throw error;
})
```

**Response Hooks**

```typescript
import client, { ClientError, Response } from 'hapic';

client.on('response', (res: Response) => {
    // Any status code that is not in the range 400-599 triggers this function.
    // Do something with the response data

    return res;
})

import client, { ClientError, Response } from 'hapic';

client.on('responseError', (error: ClientError) => {
    // Any status code that is in the range 400-599 triggers this function.
    // Do something with the response error

    return res;
})
```

**Unsubscribe**

The hook can also be removed in the following way:

```typescript
import client from 'hapic';

const hook = client.on('xxx', () => {
    // ...
});

client.off(hook);
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
