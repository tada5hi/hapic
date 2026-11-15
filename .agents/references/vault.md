# Vault reference

Read before changing `packages/vault`. Compared on 2026-11-13 against the Vault 2.x API docs (`content/vault/v2.x`, latest release v2.2.2); nothing here was run against a live Vault.

Source of truth: [Vault HTTP API](https://developer.hashicorp.com/vault/api-docs) ([KV v1](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v1), [KV v2](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2), [`/sys/mounts`](https://developer.hashicorp.com/vault/api-docs/system/mounts)). Docs sources: `hashicorp/web-unified-docs`, `content/vault/<version>/content/api-docs/`. Server behavior: `hashicorp/vault`, `http/logical.go`, `vault/mount.go` and `vault/logical_system.go`; KV v2 handlers in `hashicorp/vault-plugin-secrets-kv` (`path_*.go`).

## Conventions

- The base URL must include `/v1/`; domain paths are relative to it.
- `X-Vault-Token` carries the token, `X-Vault-Request: true` is sent on every request, `X-Vault-Namespace` selects a namespace (`VaultClient.setNamespace`, `connectionOptions.namespace` or `?namespace=` on the connection string host).
- Errors have the body `{ errors: string[] }`. A 404 means a missing path or missing permission; an empty LIST and a soft-deleted or destroyed KV v2 version also answer 404.
- PATCH is accepted only with `Content-Type: application/merge-patch+json` (otherwise 415).
- LIST is not a `MethodName`; the equivalent is `GET <path>?list=true`.

## Endpoint mapping

| Upstream | This project (`packages/vault/src/domains/`) |
|---|---|
| KV v1 `POST /<mount>/<path>` | `key-value/v1.ts` `create` |
| KV v1 `GET /<mount>/<path>` | `key-value/v1.ts` `getOne`, `findOne` (404 → `undefined`) |
| KV v1 `LIST /<mount>/<path>` | `key-value/v1.ts` `getKeys` (`GET ...?list=true`, 404 → `[]`) |
| KV v1 `DELETE /<mount>/<path>` | `key-value/v1.ts` `delete` |
| KV v2 `GET` / `POST /<mount>/config` | `key-value/v2.ts` `getConfig`, `setConfig` |
| KV v2 `POST /<mount>/data/<path>` | `key-value/v2.ts` `create` / `save` |
| KV v2 `GET /<mount>/data/<path>?version=N` | `key-value/v2.ts` `getOne` (full envelope), `findOne` (404 → `undefined`) |
| KV v2 `PATCH /<mount>/data/<path>` | `key-value/v2.ts` `update` |
| KV v2 `DELETE /<mount>/data/<path>` | `key-value/v2.ts` `delete` (soft delete of the latest version) |
| KV v2 `POST /<mount>/delete/<path>` | `key-value/v2.ts` `deleteVersions` |
| KV v2 `POST /<mount>/undelete/<path>` | `key-value/v2.ts` `undeleteVersions` |
| KV v2 `PUT /<mount>/destroy/<path>` | `key-value/v2.ts` `destroyVersions` |
| KV v2 `GET /<mount>/subkeys/<path>` | `key-value/v2.ts` `getSubkeys` (`version`, `depth` only when set) |
| KV v2 `LIST /<mount>/metadata/<path>` | `key-value/v2.ts` `getKeys` (`GET ...?list=true`, 404 → `[]`) |
| KV v2 `GET` / `POST /<mount>/metadata/<path>` | `key-value/v2.ts` `getMetadata`, `saveMetadata` |
| KV v2 `DELETE /<mount>/metadata/<path>` | `key-value/v2.ts` `deleteMetadata` (permanent, all versions) |
| `POST /sys/mounts/<path>` (enable) | `mount/module.ts` `create` |
| `GET` / `POST /sys/mounts/<path>/tune` | `mount/module.ts` `getTune`, `update` |
| `GET /sys/mounts`, `GET /sys/mounts/<path>` | `mount/module.ts` `getMany`, `getOne` (`Mount`) |
| `DELETE /sys/mounts/<path>` | `mount/module.ts` `delete` |

An empty `getKeys` path lists the mount root (`<mount>/?list=true`, `<mount>/metadata/?list=true`); the server appends the trailing `/` for a list anyway (`http/logical.go`). `/sys/mounts` has no LIST form.

Not covered by the client: KV v2 `PATCH /metadata`, the `exclude_deleted` list parameter, the Enterprise `read_snapshot_id` parameter and `RECOVER` method.

## Differences from upstream

- The namespace is configured on the client (`connectionOptions.namespace`, or `?namespace=` on the connection string host) and sent as `X-Vault-Namespace`; it is not part of the request path.
- Tune write and read accept more than the docs list (`options`, `identity_token_key`, `trim_request_trailing_slashes`, `vault/logical_system.go`); `MountUpdatePayload` follows the docs.
