<p align="center">
    <img src="./assets/logo.svg" alt="@hapic/vault logo" width="120" />
</p>

<h1 align="center">@hapic/vault</h1>

<p align="center">
    <b>A HashiCorp Vault client for key-value v1 and v2 secrets and secrets engine mounts.</b><br>
    You stop assembling <code>/v1/</code> paths, token and namespace headers and the KV v2 sub-paths by hand,<br>
    and a missing secret can be an <code>undefined</code> instead of a caught 404.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hapic/vault"><img src="https://img.shields.io/npm/v/@hapic/vault" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net/packages/vault"><b>Documentation</b></a>
    ·
    <a href="#connection">Connection</a>
    ·
    <a href="#key-value-v2">Key-value v2</a>
    ·
    <a href="#key-value-v1">Key-value v1</a>
    ·
    <a href="#mounts">Mounts</a>
    ·
    <a href="#errors">Errors</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why @hapic/vault?

Vault's HTTP API is plain JSON over HTTP, but every call needs the same setup: the `/v1/` prefix, the `X-Vault-Token` header, an `X-Vault-Namespace` header on Enterprise or HCP, and for the KV v2 engine a different sub-path per operation (`data/`, `metadata/`, `delete/`, `undelete/`, `destroy/`, `subkeys/`). Listing uses a `LIST` verb, patching needs a special content type, and a missing secret is a 404 you have to tell apart from a real failure.

`@hapic/vault` puts that into one client built on [`hapic`](https://www.npmjs.com/package/hapic):

| Concern | Without it | With @hapic/vault |
|---|---|---|
| **Connection** | Base URL, token header and namespace header set on every request. | One `connectionString` (`token@host`, namespace as `?namespace=`) or `connectionOptions`; the headers are set once on the client. |
| **KV v2 paths** | You remember which operation lives under `data/`, `metadata/`, `delete/`, `undelete/`, `destroy/` or `subkeys/`. | One method per operation: `getOne`, `getMetadata`, `deleteVersions`, `undeleteVersions`, `destroyVersions`, `getSubkeys`, … |
| **Listing** | `LIST` or `GET ?list=true`, and an empty folder answers 404. | `getKeys()` resolves with `string[]`, `[]` for an empty or missing folder. |
| **Patching** | A `PATCH` without `Content-Type: application/merge-patch+json` is rejected with 415. | `keyValueV2.update()` sends the merge patch content type. |
| **Missing secrets** | You catch the 404 and check the status. | `findOne()` resolves with `undefined`; other errors still reject. |
| **Typing** | `any` from `response.json()`. | Typed response envelopes (`ResourceResponse<T>`, `KeyValueV2GetOneResponse<T>`, `Mount`, `KeyValueV2Metadata`, …). |

The same read, twice:

```typescript
// with fetch
const response = await fetch('https://vault.example.com:8200/v1/secret/data/db-credentials', {
    headers: {
        'X-Vault-Token': 'hvs.CAESIA…',
        'X-Vault-Namespace': 'team-a',
    },
});
if (response.status === 404) {
    // missing, or no permission to read it
} else if (!response.ok) {
    throw new Error(`vault answered ${response.status}`);
}
const body = await response.json();
const password = body.data.data.password;
```

```typescript
// with @hapic/vault
import { VaultClient } from '@hapic/vault';

const client = new VaultClient({
    connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/?namespace=team-a',
});

const secret = await client.keyValueV2.findOne<{ password: string }>('secret', 'db-credentials');
const password = secret?.data.data.password; // undefined when missing
```

**Table of Contents**
- [Installation](#installation)
- [Connection](#connection)
- [Key-value v2](#key-value-v2)
  - [Versions and deletion](#versions-and-deletion)
  - [Metadata, subkeys and engine configuration](#metadata-subkeys-and-engine-configuration)
- [Key-value v1](#key-value-v1)
- [Mounts](#mounts)
- [Response envelope](#response-envelope)
- [Instances](#instances)
- [Errors](#errors)
- [Migrating to v4](#migrating-to-v4)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @hapic/vault hapic --save
```

- ESM only (`import`), with type declarations. There is no CommonJS build.
- Node.js `>=22.0.0`. It also runs in browsers and workers, because requests go through `fetch`.
- `hapic` is a peer dependency: install it next to this package. `VaultClient` extends its `Client`, so hooks, headers, transports and the `timeout` option work as described in the [hapic guide](https://hapic.tada5hi.net/guide/).

## Connection

`VaultClient` authenticates with a Vault token, sent as the `X-Vault-Token` header. Pass it with the host as a connection string in the format `token@host`, or as `connectionOptions`:

```typescript
import { VaultClient } from '@hapic/vault';

// connection string
const client = new VaultClient({
    connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/',
});

// connection options, with request options for the base client
const other = new VaultClient({
    request: {
        timeout: 10_000,
        credentials: 'include',
    },
    connectionOptions: {
        host: 'https://vault.example.com:8200/v1/',
        token: 'hvs.CAESIA…',
        namespace: 'team-a',
    },
});
```

| Field | Type | Description |
|---|---|---|
| `request` | `ClientOptionsInput` | Options of the base `hapic` client (`timeout`, `headers`, `transport`, `proxy`, fetch options, …) |
| `connectionString` | `string` | `token@host`, the host optionally with `?namespace=…` |
| `connectionOptions.host` | `string` | Base URL, including `/v1/` |
| `connectionOptions.token` | `string` | Sent as `X-Vault-Token` |
| `connectionOptions.namespace` | `string` | Optional, sent as `X-Vault-Namespace` |

Rules:

- **The host is the base URL, `/v1/` included.** Every method appends its path to it (`secret/data/db-credentials`, `sys/mounts/apps`); the client does not add `/v1/` for you.
- **`connectionOptions` wins** when both are given; the `connectionString` is then not even parsed. An empty `connectionString` counts as not given.
- **A connection string needs exactly one `@`.** Anything else throws a `ConnectionStringParseError` from the constructor.
- Every request carries `X-Vault-Request: true` and `Content-Type: application/json`.

### Namespaces

On Vault Enterprise and HCP Vault a namespace selects the tenant. It is sent as the `X-Vault-Namespace` header, never as part of the path:

```typescript
// as query parameter of the host: removed from the base URL, decoded, sent as header
const nested = new VaultClient({
    connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/?namespace=team-a%2Fsub',
});
nested.getBaseURL(); // https://vault.example.com:8200/v1/

// change it later
nested.setNamespace('team-b');
nested.unsetNamespace();
```

- `namespace` is the only query parameter the host may carry. Request paths are appended to the host, so any other query parameter stays in the base URL and ends up in the middle of every request URL.
- A nested namespace (`team-a/sub`) may be percent-encoded or written as is; `+` decodes to a space, and a malformed escape throws a `ConnectionStringParseError`.
- `applyConfig(input)` connects an existing client again (`client.applyConfig({ connectionString: '…' })`). A connection without a namespace removes an `X-Vault-Namespace` header left by an earlier one.

## Key-value v2

The versioned engine. `mount` is the path the engine is mounted at (`secret`), `path` the secret below it; the client inserts `data/`, `metadata/` and the other sub-paths.

```typescript
// write a version (create and save are the same call)
await client.keyValueV2.create('secret', 'db-credentials', {
    data: { username: 'app', password: 's3cr3t' },
});

// read the latest version
const latest = await client.keyValueV2.getOne<{ username: string, password: string }>('secret', 'db-credentials');
latest.data.data.password;     // 's3cr3t'
latest.data.metadata.version;  // 1

// read a specific version
const first = await client.keyValueV2.getOne('secret', 'db-credentials', 1);

// undefined instead of a 404
const maybe = await client.keyValueV2.findOne('secret', 'db-credentials');

// JSON merge patch into a new version: other keys are kept, null removes a key
await client.keyValueV2.update('secret', 'db-credentials', {
    data: { password: 'rotated' },
});

// check-and-set: write only if the current version is 2
await client.keyValueV2.save('secret', 'db-credentials', {
    options: { cas: 2 },
    data: { username: 'app', password: 'next' },
});

// keys below a folder; folders end with "/", [] when empty
const keys = await client.keyValueV2.getKeys('secret', 'apps/');
const rootKeys = await client.keyValueV2.getKeys('secret');
```

| Method | Request | Resolves with |
|---|---|---|
| `create(mount, path, payload)` / `save(…)` | `POST <mount>/data/<path>` | `{ data: KeyValueV2VersionMetadata }` |
| `getOne<T>(mount, path, version?)` | `GET <mount>/data/<path>?version=N` (`0`, the latest, when not set) | `{ data: { data: T, metadata } }` |
| `findOne<T>(mount, path, version?)` | as `getOne` | the same, or `undefined` on a 404 |
| `update(mount, path, payload)` | `PATCH <mount>/data/<path>`, `application/merge-patch+json` | `{ data: KeyValueV2VersionMetadata }` |
| `getKeys(mount, path = '')` | `GET <mount>/metadata/<path>?list=true` | `string[]`, `[]` on a 404 |

- The payload is `{ data, options?: { cas? } }`. With `cas: 0` the write succeeds only if the key does not exist yet; with `cas_required` set on the mount or key, every write needs `cas`.
- `update` needs an existing secret (Vault answers 404 otherwise) and the `patch` capability in the token's policy. Its body is merged into the latest version and stored as a new version.
- `create` and `save` replace the whole secret: keys you leave out are not in the new version.

### Versions and deletion

KV v2 keeps old versions. Deleting is a range of operations, from a reversible soft delete to removing the key with its history:

```typescript
// soft delete the latest version, then restore it
await client.keyValueV2.delete('secret', 'db-credentials');
await client.keyValueV2.undeleteVersions('secret', 'db-credentials', [3]);

// soft delete specific versions
await client.keyValueV2.deleteVersions('secret', 'db-credentials', [1, 2]);

// remove the data of versions for good
await client.keyValueV2.destroyVersions('secret', 'db-credentials', [1]);

// remove the key, its metadata and every version for good
await client.keyValueV2.deleteMetadata('secret', 'db-credentials');
```

<p align="center">
    <img src="./assets/secret-versions.svg" alt="State diagram of a key-value v2 secret version. create, save and update write a new version, which is readable: getOne returns its data and the previous version stays readable. delete soft deletes the latest version and deleteVersions soft deletes the given versions: getOne answers 404, deletion_time is set and the data is kept. undeleteVersions makes a soft deleted version readable again. destroyVersions removes the data of a readable or soft deleted version permanently; its metadata stays and is marked destroyed. deleteMetadata removes the metadata and every version of the secret, whatever its state. Neither destroyVersions nor deleteMetadata can be undone." width="100%" />
</p>

| Method | Request | Effect | Reversible |
|---|---|---|---|
| `delete(mount, path)` | `DELETE <mount>/data/<path>` | Soft deletes the latest version | yes, `undeleteVersions` |
| `deleteVersions(mount, path, versions)` | `POST <mount>/delete/<path>` | Soft deletes the given versions | yes, `undeleteVersions` |
| `undeleteVersions(mount, path, versions)` | `POST <mount>/undelete/<path>` | Makes soft deleted versions readable again | |
| `destroyVersions(mount, path, versions)` | `PUT <mount>/destroy/<path>` | Removes the data of the given versions; their metadata stays with `destroyed: true` | no |
| `deleteMetadata(mount, path)` | `DELETE <mount>/metadata/<path>` | Removes the metadata and every version of the key | no |

A soft deleted or destroyed version answers 404 on `getOne` (`findOne` resolves with `undefined`). Its `deletion_time` and `destroyed` fields stay visible in `getMetadata`.

### Metadata, subkeys and engine configuration

```typescript
// version-agnostic metadata and the list of versions
const { data: metadata } = await client.keyValueV2.getMetadata('secret', 'db-credentials');
metadata.current_version;
metadata.versions['1']?.destroyed;
metadata.custom_metadata?.owner; // custom_metadata is null when none is set

// create or replace the metadata; does not create a version
await client.keyValueV2.saveMetadata('secret', 'db-credentials', {
    max_versions: 5,
    custom_metadata: { owner: 'team-a' },
});

// the key structure of a version, every leaf value replaced by null
const { data: subkeys } = await client.keyValueV2.getSubkeys('secret', 'db-credentials', { depth: 1 });
// subkeys.subkeys: { username: null, password: null }

// settings for every key of the mount
await client.keyValueV2.setConfig('secret', { max_versions: 10, cas_required: false });
const { data: config } = await client.keyValueV2.getConfig('secret');
// config: { max_versions: 10, cas_required: false, delete_version_after: '0s' }
```

| Method | Request | Resolves with |
|---|---|---|
| `getMetadata(mount, path)` | `GET <mount>/metadata/<path>` | `ResourceResponse<KeyValueV2Metadata>` |
| `saveMetadata(mount, path, payload)` | `POST <mount>/metadata/<path>` | nothing |
| `getSubkeys(mount, path, { version?, depth? })` | `GET <mount>/subkeys/<path>` | `ResourceResponse<KeyValueV2Subkeys>` |
| `getConfig(mount)` | `GET <mount>/config` | `ResourceResponse<KeyValueV2Config>` |
| `setConfig(mount, payload)` | `POST <mount>/config` | nothing |

`getSubkeys` sends `version` and `depth` only when set: the latest version, no depth limit.

## Key-value v1

The unversioned engine: reads and writes go to the path itself, a write replaces the secret, and a delete removes it for good.

```typescript
await client.keyValueV1.create('kv', 'api-key', { value: 'abc123' });

const secret = await client.keyValueV1.getOne<{ value: string }>('kv', 'api-key');
// { data: { value: 'abc123' }, lease_duration: 2764800, request_id: '…', … }

// undefined instead of a 404
const maybe = await client.keyValueV1.findOne('kv', 'api-key');

// keys below a folder or at the mount root; [] when empty
const keys = await client.keyValueV1.getKeys('kv', 'apps/');
const rootKeys = await client.keyValueV1.getKeys('kv');

await client.keyValueV1.delete('kv', 'api-key');
```

| Method | Request | Resolves with |
|---|---|---|
| `create(mount, path, data)` | `POST <mount>/<path>` | the response body (Vault sends none) |
| `getOne<T>(mount, path)` | `GET <mount>/<path>` | `ResourceResponse<T>` |
| `findOne<T>(mount, path)` | as `getOne` | the same, or `undefined` on a 404 |
| `getKeys(mount, path = '')` | `GET <mount>/<path>?list=true` | `string[]`, `[]` on a 404 |
| `delete(mount, path)` | `DELETE <mount>/<path>` | nothing |

## Mounts

`client.mount` enables, tunes, reads and disables secrets engines under `sys/mounts`:

```typescript
import { KeyValueVersion, MountType } from '@hapic/vault';

// enable a KV v2 engine at apps/
await client.mount.create('apps', {
    type: MountType.KEY_VALUE,
    description: 'application secrets',
    options: { version: KeyValueVersion.TWO },
    config: { default_lease_ttl: '1h' },
});

// tune it: TTLs in seconds or as duration strings
await client.mount.update('apps', { default_lease_ttl: '30m', max_lease_ttl: 86400 });

// the effective settings, TTLs in seconds
const { data: tune } = await client.mount.getTune('apps');

// every mount, keyed by path with a trailing slash
const { data: mounts } = await client.mount.getMany();
mounts['apps/']?.options?.version; // '2'

const { data: mount } = await client.mount.getOne('apps');
// { type: 'kv', accessor: 'kv_…', uuid: '…', config: { default_lease_ttl: 0, … }, … }

// disable it, with every secret it holds
await client.mount.delete('apps');
```

| Method | Request | Resolves with |
|---|---|---|
| `create(path, payload)` | `POST sys/mounts/<path>` | the response body (Vault sends none) |
| `update(path, payload)` | `POST sys/mounts/<path>/tune` | the response body |
| `getTune(path)` | `GET sys/mounts/<path>/tune` | `ResourceResponse<MountTune>` |
| `getMany()` | `GET sys/mounts` | `ResourceResponse<Record<string, Mount>>` |
| `getOne(path)` | `GET sys/mounts/<path>` | `ResourceResponse<Mount>` |
| `delete(path)` | `DELETE sys/mounts/<path>` | nothing |

- `type` takes a `MountType` value (`kv`, `pki`, `transit`, `database`, …) or the name of a registered plugin as a string.
- `KeyValueVersion.ONE` and `KeyValueVersion.TWO` are the strings `'1'` and `'2'`, as Vault stores and returns `options.version`. A number is a type error.
- `create` sends `options: {}` and `config: {}` when you leave them out. `config` TTLs are duration strings (`'30m'`); the tune payload of `update` also takes seconds.
- Deleting a mount deletes every secret stored under it.

## Response envelope

Vault wraps every answer in the same envelope; the methods resolve with it rather than with `data` alone, so lease and warning fields stay reachable:

```typescript
import type { ResourceResponse } from '@hapic/vault';

const response: ResourceResponse<{ value: string }> = await client.keyValueV1.getOne('kv', 'api-key');

response.data.value;
response.lease_duration;
response.request_id;
response.warnings;   // string[] | null
response.wrap_info;  // set for a wrapped response
```

| Field | Type |
|---|---|
| `data` | `T` |
| `request_id`, `lease_id` | `string` |
| `lease_duration` | `number` (seconds) |
| `renewable` | `boolean` |
| `warnings` | `string[] \| null`, optional |
| `auth` | `ResourceResponseAuth \| null`, optional |
| `wrap_info` | `ResourceResponseWrapInfo \| null`, optional |
| `mount_type` | `string`, optional |

KV v2 reads nest once more: `getOne()` resolves with `{ data: { data, metadata } }`, so the secret is at `response.data.data`.

## Instances

The package keeps a registry of clients, keyed by name (`'default'` when you pass none):

```typescript
import { VaultClient, isClient, setClient, useClient } from '@hapic/vault';

setClient(new VaultClient({ connectionString: 'hvs.CAESIA…@https://vault.example.com:8200/v1/' }));

// anywhere else in your code
const shared = useClient();

isClient(shared); // true
```

| Function | Description |
|---|---|
| `createClient(input?)` | Create a new `VaultClient`. It is not registered |
| `setClient(client, key?)` | Register a client under `key` and return it |
| `useClient(key?)` | Return the client registered under `key`, or create one without configuration, register it and return it |
| `hasClient(key?)` / `unsetClient(key?)` | Check for or remove a registered client |
| `isClient(input)` | `true` for a `VaultClient`, also one from another copy of the package (marker `Symbol.for('@hapic/vault/VaultClient')`) |

The default export is a separate `VaultClient` created without configuration; it is not the one `useClient()` returns. More on the registry: [Instance Registry](https://hapic.tada5hi.net/guide/instance).

## Errors

A response with a status of 400 to 599 rejects with an `HttpResponseError`; Vault puts its messages in `{ errors: string[] }`. A request without a response (network failure, abort, timeout) rejects with a `NetworkError`.

```typescript
import { isClientErrorWithStatusCode, isHttpResponseError } from '@hapic/vault';

try {
    await client.keyValueV2.getOne('secret', 'db-credentials');
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        // missing, soft deleted, destroyed, or the token may not read it
    } else if (isHttpResponseError(error)) {
        console.log(error.status, error.response?.data?.errors);
    }
}
```

- **A 404 also means "no permission".** Vault answers 404 for a missing path, a path the token may not read, an empty `LIST`, and a soft deleted or destroyed KV v2 version. `findOne` turns every 404 into `undefined` and `getKeys` into `[]`; a 403 and any other error still reject.
- An invalid `connectionString` throws a `ConnectionStringParseError` (`code: 'connection_string_invalid'`) from the constructor or `applyConfig`; test for it with `isConnectionStringParseError`.

| Guard | Matches |
|---|---|
| `isHapicError` | Any error thrown by `hapic` or a `@hapic/*` package |
| `isClientError` | Any request error (`HttpResponseError` or `NetworkError`) |
| `isHttpResponseError` | A 4xx/5xx response; `error.response.data` holds the decoded body |
| `isNetworkError` | No response at all |
| `isClientErrorWithStatusCode(error, code \| code[])` | A response with one of these status codes |
| `isClientErrorDueNetworkIssue` | A request error without a response, except an abort |
| `isConnectionStringParseError` | An invalid connection string |

A request that hits its `timeout` rejects with the code `ETIMEDOUT`; test for it with `isClientErrorDueTimeout` from `hapic`. More on errors: [Errors](https://hapic.tada5hi.net/guide/errors).

## Migrating to v4

Version 4 aligns the client with the Vault API: `keyValueV2.delete` now soft deletes the latest version (the old behaviour is `deleteMetadata`), `KeyValueVersion` values are strings, and several mount and metadata types changed. The full list is in the [migration notes](https://hapic.tada5hi.net/packages/vault#migrating-to-v4).

## API

| Export | Kind | Purpose |
|---|---|---|
| `VaultClient` | class | Client with `keyValueV1`, `keyValueV2`, `mount`, `applyConfig`, `setNamespace`, `unsetNamespace` |
| `KeyValueV1API` | class | `create`, `getOne`, `findOne`, `getKeys`, `delete` |
| `KeyValueV2API` | class | `create`, `save`, `update`, `getOne`, `findOne`, `getKeys`, `delete`, `deleteVersions`, `undeleteVersions`, `destroyVersions`, `deleteMetadata`, `getMetadata`, `saveMetadata`, `getSubkeys`, `getConfig`, `setConfig` |
| `MountAPI` | class | `create`, `update`, `getTune`, `getMany`, `getOne`, `delete` |
| `MountType`, `KeyValueVersion` | enums | Engine types, KV engine versions (`'1'`, `'2'`) |
| `HeaderName` | enum | `Content-Type`, `X-Vault-Namespace`, `X-Vault-Request` |
| `parseConnectionString` | function | `token@host` to `ConnectionOptions` |
| `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` | functions | [Instances](#instances) |
| `isHapicError`, `isClientError`, `isHttpResponseError`, `isNetworkError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue` | functions | [Errors](#errors), re-exported from `hapic` |
| `ConnectionStringParseError`, `isConnectionStringParseError` | class, function | Invalid connection string |
| `Config`, `ConfigInput`, `ConnectionOptions` | types | Client configuration |
| `ResourceResponse`, `ResourceResponseAuth`, `ResourceResponseWrapInfo` | types | [Response envelope](#response-envelope) |
| `KeyValueV2Payload`, `KeyValueV2GetOneResponse`, `KeyValueV2CreateResponse`, `KeyValueV2VersionMetadata`, `KeyValueV2Metadata`, `KeyValueV2MetadataPayload`, `KeyValueV2Config`, `KeyValueV2ConfigPayload`, `KeyValueV2Subkeys`, `KeyValueV2SubkeysOptions`, … | types | Key-value v2 payloads and responses |
| `Mount`, `MountTune`, `MountConfig`, `MountCreatePayload`, `MountUpdatePayload`, `MountOptions`, `MountTypeInput`, … | types | Mount payloads and responses |
| default export | `VaultClient` | An unconfigured client, not the registry's `'default'` |

The domain classes also work on their own: `new KeyValueV2API({ client })` takes any `hapic` client, or request options to create one.

## Notes

- **`keyValueV2.delete` is a soft delete of the latest version**, not the removal of the secret. Use `deleteMetadata` to remove the key with its history.
- **`create` and `save` are the same request**, and both replace the secret with a new version. Use `update` to change single keys.
- **A 404 is ambiguous.** `findOne` returning `undefined` can also mean the token may not read the path. Check the policy before you treat it as "does not exist".
- **The host must end in the API prefix.** Use `https://vault.example.com:8200/v1/`; without `/v1/` every request misses the API.
- **Only `namespace` may be a query parameter of the host.** Any other one breaks every request URL.
- **Not covered:** KV v2 `PATCH` on metadata, the `exclude_deleted` list parameter, and auth methods. For anything else, use the client's `get`, `post`, `put`, `patch` and `delete` with a path relative to `/v1/`; the token and namespace headers are already set.

## Contributing

Bug reports and pull requests are welcome in the [hapic repository](https://github.com/tada5hi/hapic). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/); run `npm run build`, `npm run test` and `npm run lint` before you open a pull request.

## License

Made with 💚

Published under [MIT License](./LICENSE).
