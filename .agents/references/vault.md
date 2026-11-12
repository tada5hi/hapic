# Vault reference

Read before changing `packages/vault`. Compared on 2026-11-12 against the Vault 2.x API docs (latest release v2.2.2); nothing here was run against a live Vault.

Source of truth: [Vault HTTP API](https://developer.hashicorp.com/vault/api-docs) ([KV v1](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v1), [KV v2](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2), [`/sys/mounts`](https://developer.hashicorp.com/vault/api-docs/system/mounts)). Docs sources: `hashicorp/web-unified-docs`, `content/vault/<version>/content/api-docs/`. Server behavior: `hashicorp/vault`, `http/logical.go` and `vault/mount.go`.

## Conventions

- The base URL must include `/v1/`; domain paths are relative to it.
- `X-Vault-Token` carries the token, `X-Vault-Request: true` is sent on every request, `X-Vault-Namespace` selects a namespace (`VaultClient.setNamespace`).
- Errors have the body `{ errors: string[] }`. A 404 means a missing path or missing permission; an empty LIST and a soft-deleted or destroyed KV v2 version also answer 404.
- PATCH is accepted only with `Content-Type: application/merge-patch+json` (otherwise 415).
- LIST is not a `MethodName`; the equivalent is `GET <path>?list=true`.

## Endpoint mapping

| Upstream | This project (`packages/vault/src/domains/`) |
|---|---|
| KV v1 `POST /<mount>/<path>` | `key-value/v1.ts` `create` |
| KV v1 `GET /<mount>/<path>` | `key-value/v1.ts` `getOne` |
| KV v1 `DELETE /<mount>/<path>` | `key-value/v1.ts` `delete` |
| KV v2 `POST /<mount>/data/<path>` | `key-value/v2.ts` `create` / `save` |
| KV v2 `GET /<mount>/data/<path>?version=N` | `key-value/v2.ts` `getOne` (returns the full envelope) |
| KV v2 `PATCH /<mount>/data/<path>` | `key-value/v2.ts` `update` |
| KV v2 `DELETE /<mount>/metadata/<path>` | `key-value/v2.ts` `delete` (permanent, all versions) |
| `POST /sys/mounts/<path>` (enable) | `mount/module.ts` `create` |
| `POST /sys/mounts/<path>/tune` | `mount/module.ts` `update` |
| `GET /sys/mounts`, `GET /sys/mounts/<path>` | `mount/module.ts` `getMany`, `getOne` |
| `DELETE /sys/mounts/<path>` | `mount/module.ts` `delete` |

Not covered by the client: KV v2 `/config`, `/metadata` read and write, `/subkeys`, soft delete (`DELETE /data`), `/delete`, `/undelete`, `/destroy`, and any listing.

## Differences from upstream

- `options.version` of a KV mount is a string upstream (`"1"`, `"2"`); `KeyValueVersion` is numeric.
- A mount read returns more fields than the create payload (`accessor`, `uuid`, `running_plugin_version`, numeric TTLs).
