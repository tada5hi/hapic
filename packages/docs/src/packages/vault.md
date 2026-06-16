# @hapic/vault

A client for [HashiCorp Vault](https://www.vaultproject.io/) — read and write secrets through the key-value v1 and v2 engines, and manage mounts. It extends the base [`Client`](/guide/client).

## Installation

```bash
npm install hapic @hapic/vault --save
```

## Creating a client

`VaultClient` authenticates with a Vault **token**, sent as the `X-Vault-Token` header. Configure it with a `connectionString` in the format **`token@host`**, or with structured `connectionOptions`.

```typescript
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/',
});
```

```typescript
const client = new VaultClient({
    connectionOptions: {
        host: 'https://vault.example.com:8200/v1/',
        token: 'hvs.CAESIA…',
    },
});
```

The package exports the usual registry (`createClient`, `useClient`, `setClient`, …) — see [Instance Registry](/guide/instance).

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.keyValueV1` | `KeyValueV1API` | `create(mount, path, data)` · `getOne(mount, path)` · `delete(mount, path)` |
| `client.keyValueV2` | `KeyValueV2API` | `create` · `save` · `update` · `getOne(mount, path, version?)` · `delete` |
| `client.mount` | `MountAPI` | `create` · `update` · `getOne` · `getMany` · `delete` |

The two key-value APIs map to Vault's two KV engine versions — v2 adds versioning and check-and-set, and uses the `/data` and `/metadata` sub-paths under the hood.

## Key-value v2

```typescript
// write the first version of a secret
await client.keyValueV2.create('secret', 'db-credentials', {
    data: { username: 'app', password: 's3cr3t' },
});

// read the latest version
const { data } = await client.keyValueV2.getOne('secret', 'db-credentials');
// data.data → { username: 'app', password: 's3cr3t' }
// data.metadata → { version, created_time, … }

// read a specific version
const v1 = await client.keyValueV2.getOne('secret', 'db-credentials', 1);

// patch (merge) into a new version
await client.keyValueV2.update('secret', 'db-credentials', {
    data: { password: 'rotated' },
});

// delete (latest metadata)
await client.keyValueV2.delete('secret', 'db-credentials');
```

Pass `options.cas` in the payload to enforce check-and-set on writes:

```typescript
await client.keyValueV2.create('secret', 'db-credentials', {
    options: { cas: 2 },          // only write if current version is 2
    data: { password: 'next' },
});
```

## Key-value v1

The v1 engine is unversioned — reads and writes hit the path directly:

```typescript
await client.keyValueV1.create('secret', 'api-key', { value: 'abc123' });

const secret = await client.keyValueV1.getOne('secret', 'api-key');
// secret.data → { value: 'abc123' }

await client.keyValueV1.delete('secret', 'api-key');
```

## Managing mounts

```typescript
// enable a KV v2 secret engine at `apps/`
await client.mount.create('apps', {
    type: 'kv',
    description: 'application secrets',
    options: { version: 2 },
});

// list all mounts
const mounts = await client.mount.getMany();

// disable it
await client.mount.delete('apps');
```

## Namespaces & errors

The client can target a Vault namespace, and surfaces failures as the base [`ClientError`](/guide/errors):

```typescript
import { isClientErrorWithStatusCode } from '@hapic/vault';

try {
    await client.keyValueV2.getOne('secret', 'missing');
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        // secret does not exist
    }
}
```

An invalid `connectionString` throws a `ConnectionStringParseError` from the package.
