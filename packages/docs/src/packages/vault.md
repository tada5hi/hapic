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
        namespace: 'team-a',      // optional, sent as X-Vault-Namespace
    },
});
```

A namespace can also be passed as `namespace` query parameter of the host in the connection string. It is removed from the base URL and sent as the `X-Vault-Namespace` header; other query parameters stay on the host. Encode a nested namespace or pass it as is:

```typescript
const client = new VaultClient({
    connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/?namespace=team-a%2Fsub',
});
```

`client.setNamespace(namespace)` and `client.unsetNamespace()` change it later.

The package exports the usual registry (`createClient`, `useClient`, `setClient`, …) — see [Instance Registry](/guide/instance).

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.keyValueV1` | `KeyValueV1API` | `create(mount, path, data)` · `getOne(mount, path)` · `findOne` · `getKeys(mount, path?)` · `delete(mount, path)` |
| `client.keyValueV2` | `KeyValueV2API` | `create` · `save` · `update` · `getOne(mount, path, version?)` · `findOne` · `getKeys` · `delete` · `deleteVersions` · `undeleteVersions` · `destroyVersions` · `deleteMetadata` · `getMetadata` · `saveMetadata` · `getSubkeys` · `getConfig` · `setConfig` |
| `client.mount` | `MountAPI` | `create` · `update` · `getTune` · `getOne` · `getMany` · `delete` |

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

// read a secret that may not exist: undefined on 404 instead of an error
const maybe = await client.keyValueV2.findOne('secret', 'db-credentials');

// list the keys below a folder (folders end with `/`); [] when empty
const keys = await client.keyValueV2.getKeys('secret', 'apps/');
```

Deleting and restoring versions:

| Method | Upstream | Effect |
|--------|----------|--------|
| `delete(mount, path)` | `DELETE /:mount/data/:path` | soft deletes the latest version; can be undone |
| `deleteVersions(mount, path, versions)` | `POST /:mount/delete/:path` | soft deletes the given versions; can be undone |
| `undeleteVersions(mount, path, versions)` | `POST /:mount/undelete/:path` | restores soft deleted versions |
| `destroyVersions(mount, path, versions)` | `PUT /:mount/destroy/:path` | removes the data of the given versions permanently |
| `deleteMetadata(mount, path)` | `DELETE /:mount/metadata/:path` | removes the metadata and all versions permanently |

```typescript
await client.keyValueV2.delete('secret', 'db-credentials');
await client.keyValueV2.undeleteVersions('secret', 'db-credentials', [3]);

// remove the secret with its whole history
await client.keyValueV2.deleteMetadata('secret', 'db-credentials');
```

Metadata, subkeys and engine configuration:

```typescript
const { data: metadata } = await client.keyValueV2.getMetadata('secret', 'db-credentials');
// metadata.current_version, metadata.versions, metadata.custom_metadata, …

await client.keyValueV2.saveMetadata('secret', 'db-credentials', {
    max_versions: 5,
    custom_metadata: { owner: 'team-a' },
});

// the key structure of a version, every leaf value replaced by null
const { data: subkeys } = await client.keyValueV2.getSubkeys('secret', 'db-credentials', { depth: 1 });

await client.keyValueV2.setConfig('secret', { max_versions: 10, cas_required: false });
const { data: config } = await client.keyValueV2.getConfig('secret');
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

// undefined instead of a 404 error
const maybe = await client.keyValueV1.findOne('secret', 'api-key');

// keys at the mount root; [] when empty
const keys = await client.keyValueV1.getKeys('secret');

await client.keyValueV1.delete('secret', 'api-key');
```

## Managing mounts

```typescript
import { KeyValueVersion } from '@hapic/vault';

// enable a KV v2 secret engine at `apps/`
await client.mount.create('apps', {
    type: 'kv',
    description: 'application secrets',
    options: { version: KeyValueVersion.TWO },   // '2'
});

// list all mounts, keyed by path ('apps/', 'secret/', …)
const { data: mounts } = await client.mount.getMany();

// effective TTLs (in seconds) and other tune settings
const { data: tune } = await client.mount.getTune('apps');

// tune: TTLs as seconds or duration strings
await client.mount.update('apps', { default_lease_ttl: '1h' });

// disable it
await client.mount.delete('apps');
```

## Errors

The client surfaces failures as the base [`ClientError`](/guide/errors):

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

`findOne` and `getKeys` cover the common 404 case; Vault also answers 404 when the token may not read a path. Other errors (for example 403) are thrown.

An invalid `connectionString` throws a `ConnectionStringParseError` from the package.

## Migrating to v4

- `keyValueV2.delete` now soft deletes the latest version (`DELETE /:mount/data/:path`). The previous behaviour, removing the metadata and all versions permanently, is `keyValueV2.deleteMetadata`.
- `KeyValueVersion.ONE` / `TWO` are the strings `'1'` / `'2'`, as Vault stores and returns `options.version`. Replace numeric `options: { version: 2 }` with `'2'` or `KeyValueVersion.TWO`.
- `MountCreatePayload` no longer has `generate_signing_key`, which is not a `/sys/mounts` parameter.
- `MountUpdatePayload` (tune) no longer has `force_no_cache`, which is not a tune parameter.
- `mount.getMany` and `mount.getOne` return `Mount` entries (with `accessor`, `uuid`, numeric TTLs, …) instead of `MountCreatePayload`.
