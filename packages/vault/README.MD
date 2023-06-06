# @hapic/vault 🔒

[![npm version](https://badge.fury.io/js/@hapic%2Fvault.svg)](https://badge.fury.io/js/@hapic%2Fvault)
[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This client provides a convenient way to interact with various endpoints in Vault,
such as secrets, engines, and more.
Vault is a popular open-source tool used for securely storing and accessing sensitive data,
such as passwords, API keys, and certificates.
The client offers a range of abstractions to simplify interactions with Vault and
streamline the development process.
Whether you are a seasoned developer or new to the world of secrets management,
this API client is a powerful tool to help you get the most out of Vault.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [KeyValue V1](#keyvalue-v1)
  - [KeyValue V2](#keyvalue-v2)
  - [Mount](#mount)
- [License](#license)

## Installation

```bash
npm install @hapic/vault --save
```

## Usage

### Config

To create a configuration for the  `VaultClient`, a configuration must be specified,
like described in the following:

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    request: {
        credentials: 'include',
    },
    conenctionOptions: {
        host: 'https://example.com/api/v1/',
        token: 'xxx',
    },
    // connectionString: 'xxx@https://example.com/v1/'
});
```

### KeyValue V1

**`Create`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV1.create(
    'engine',
    'path',
    {
        foo: 'bar'
    }
);
```

**`GetOne`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

const data = await client.keyValueV1.getOne(
    'engine',
    'path',
);
console.log(data);
// { data: { foo: 'bar' }, lease_duration: 0, ... }
```

**`Delete`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV1.delete(
    'engine',
    'path',
);
```

### KeyValue V2

**`Create`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV2.create(
    'engine',
    'path',
    {
        data: {
            foo: 'bar'
        }
    }
);
```

**`GetOne`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

const data = await client.keyValueV2.getOne('engine', 'path');
console.log(data);
// { data: { data: { foo: 'bar' }, ... } }
```

**`Update`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV2.create(
    'engine',
    'path',
    {
        data: {
            baz: 'boz'
        }
    }
);
```

**`Delete`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV2.delete('engine','path');
```

**`Save`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.keyValueV2.save(
    'engine',
    'path',
    {
        data: {
            foo: 'bar'
        }
    }
);
```

### Mount

**`Create`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.mount.create(
    'engine',
    {
        type: 'kv',
        generate_signing_key: true
    }
);
```

**`GetMany`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

const data = await client.mount.getMany();
console.log(data);
// {
//      data: {
//          'engine/': {
//              type: 'kv',
//              uuid: 'xxx',
//           }
//       },
//       lease_duration: 0,
//       ...
// }
```

**`GetOne`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

const data = await client.mount.getOne('engine');
console.log(data);
// { data: { type: 'kv', uuid: 'xxx' }, lease_duration: 0, ... }
```

**`Delete`**

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    // ...
});

await client.mount.delete('engine');
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
