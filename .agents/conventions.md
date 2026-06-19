# Conventions

## Tooling

| Tool                                   | Purpose                                                                 |
|----------------------------------------|-------------------------------------------------------------------------|
| npm workspaces                         | Monorepo package management (`packages/*`)                              |
| [Nx](https://nx.dev)                   | Task orchestration & caching for `build` / `lint` / `test`; `build` depends on `^build` |
| [tsdown](https://tsdown.dev) (rolldown) | Bundles each package to ESM (`.mjs`) + type declarations (`.d.mts`)     |
| ESLint (`@tada5hi/eslint-config`, flat config) | Linting (`eslint`)                                              |
| [Vitest](https://vitest.dev)           | Tests (see [testing.md](testing.md))                                    |
| commitlint (`@tada5hi/commitlint-config`) + Husky | Enforces Conventional Commits on `commit-msg`                |
| release-please + `workspaces-publish`  | Versioning, changelogs, and publishing                                  |

## Workflow

- After making changes, **always build the affected package and run the linter** on the changed files. Use `npm run build` / `npm run lint` (Nx caches results, so re-runs are cheap).
- When changing the base `hapic` package, build it before testing service clients — they `peerDepend` on it and Nx will rebuild it via `^build`.
- When changing user-facing behavior, update the VitePress docs under `packages/docs/src/guide/`.
- Never duplicate base types/helpers into a service package — re-export them from `hapic` (see each package's `client.ts`).

## Code Style

- **Module format**: TypeScript, ESM source compiled to **ESM-only** output (`.mjs` + `.d.mts`); every published package sets `"type": "module"`.
- **Indentation**: 4 spaces (`.editorconfig`).
- **Line endings**: LF; UTF-8; trailing whitespace trimmed; final newline inserted (except `*.md`).
- **Linting**: single root flat config (`eslint.config.js`) that spreads `await config({ typescript: true, vue: false })` from `@tada5hi/eslint-config`. `dist/`, `*.d.ts`, `coverage`/`writable`, and `packages/docs` are ignored. Notable disabled rules: `class-methods-use-this`, `dot-notation`, `no-continue`, `no-use-before-define`, `no-shadow`, `no-unused-vars` (and their `@typescript-eslint` variants).
- **Parameter defaulting**: when a function or constructor accepts an optional options/config bag, default it with a **default parameter value**, not an optional parameter reassigned in the body:

  ```typescript
  // preferred
  constructor(input: ConfigInput = {}) { /* ... */ }

  // avoid
  constructor(input?: ConfigInput) { input = input || {}; /* ... */ }
  ```

- **File header**: every source file starts with the standard copyright block:

  ```typescript
  /*
   * Copyright (c) <year>.
   * Author Peter Placzek (tada5hi)
   * For the full copyright and license information,
   * view the LICENSE file that was distributed with this source code.
   */
  ```

## Naming Conventions

| Kind                     | Convention                                  | Examples                                            |
|--------------------------|---------------------------------------------|-----------------------------------------------------|
| Files / directories      | `kebab-case`                                | `has-own-property.ts`, `project-repository/`        |
| Client classes           | `<Service>Client` extending `Client`        | `HarborClient`, `OAuth2Client`, `VaultClient`       |
| Domain API classes       | `<Domain>API` extending `BaseAPI`           | `ProjectAPI`, `RobotAPI`, `TokenAPI`                |
| Config types             | `Config`, `ConfigInput`, `ConnectionOptions`| `ConfigInput = Partial<Config>`                     |
| Context types            | `*Context`                                  | `BaseAPIContext`, `ClientErrorContext`              |
| Request option types     | `RequestBaseOptions`, `RequestOptions`      | —                                                   |
| Enums                    | `PascalCase` name, `UPPER_SNAKE` members    | `MethodName.GET`, `ResponseType.JSON`, `HookName.REQUEST` |
| Instance guards          | `is<Thing>`                                 | `isClient`, `isClientError`, `isResponse`           |
| Interfaces               | `I<Name>` — **only** for shapes a class implements | `IClient` (impl. by `Client`), `ITransport` (impl. by `FetchTransport`, `MemoryTransport`) |

> Type-file naming is **inconsistent** across packages: some domains use `type.ts`, others `types.ts`. Match the sibling files in the directory you are editing rather than imposing one form.

## File Organization

- Exported **types** live in a `type.ts` (or `types.ts`) file in the same directory as the implementation.
- Barrel `index.ts` files re-export from `type.ts` and the implementation modules; the package root `src/index.ts` is the public API surface.
- Each service client mirrors the base layout: `module.ts` (client class), `instance.ts` (singleton registry), `config/`, `domains/`, `utils/`.

## TypeScript

- Root `tsconfig.json` extends `@tada5hi/tsconfig`: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `allowImportingTsExtensions`, `noEmit` (`noUncheckedIndexedAccess` kept off to preserve the project's prior strictness).
- Each package's `tsconfig.json` extends the root config, sets `include` (`src` + `test`), and adds `types: ["node", "vitest/globals"]`.
- Both the JS bundle and the `.d.mts` declarations are emitted by **tsdown** — there is no separate `tsc` build step.
- **`interface` vs `type`**: use an `interface` **only** for a shape that a class `implements`, and prefix it with `I` (e.g. `IClient`, implemented by `Client`; `ITransport`, implemented by `FetchTransport` / `MemoryTransport`). Everything else — data shapes, option bags, unions — is a `type` with no prefix (e.g. `TransportRequest`, `ClientOptions`). Some older interfaces predate this rule; apply it to new and edited code rather than rewriting the whole tree.

## Build Output

- Each package builds to `dist/` containing `index.mjs` and `index.d.mts` (plus source maps) — **ESM only**. Only `dist/` is published (`"files": ["dist/"]`).
- Per-package `build` = `tsdown` (config in `tsdown.config.ts`: `entry: src/index.ts`, `format: 'esm'`, `dts: true`, `sourcemap: true`); tsdown cleans `dist/` itself.
- tsdown treats `dependencies` + `peerDependencies` + Node builtins as external by default.

## Commit Convention

Commits follow **[Conventional Commits](https://www.conventionalcommits.org/)**, validated by commitlint (`@tada5hi/commitlint-config`) through a Husky `commit-msg` hook (`.husky/commit-msg`):

```
<type>[optional scope][!]: <description>

[optional body]
[optional footer]
```

Common types: `feat`, `fix`, `chore`, `build`, `ci`, `docs`, `refactor`, `test`. `npm run commit` launches the interactive `git-cz` prompt. Commit messages drive release-please's version bumps and changelog generation, so write them accurately.

## Release Process

Releases are automated by [release-please](https://github.com/googleapis/release-please) (config in `release-please-config.json`, versions tracked in `.release-please-manifest.json`):

- `release-type: node`, `include-component-in-tag: true` — each package is released independently with a component-tagged release (e.g. `client-vX`, `harbor-vX`).
- The `node-workspace` plugin keeps cross-package `peerDependencies` ranges in sync.
- `bump-minor-pre-major` / `bump-patch-for-minor-pre-major` govern pre-1.0 bumps.
- On a release commit to `master`, CI builds and publishes via `npx workspaces-publish`.

## CI/CD

GitHub Actions (`.github/workflows/main.yml`) on push/PR to `master`: **install → build → (lint ‖ test matrix) → release + docs deploy**. The test matrix covers `client`, `harbor`, `oauth2` only. Docs deploy publishes the VitePress site to GitHub Pages (`hapic.tada5hi.net`) on `master`. See [testing.md](testing.md#ci-pipeline). Reusable composite actions live in `.github/actions/{install,build}`.

## Best Practices

- Use **ESM** and modern TypeScript; keep code cross-environment safe (Node, browser, workers) — go through `fetch.ts` rather than referencing `node:`/global APIs directly.
- Before adding code, study the surrounding domain for its naming, file layout, and how it threads the `client` through `BaseAPI`.
- Domain `*API` methods must route through `this.client`; never call `fetch` directly.
- Register an `@instanceof` marker (`markInstanceof(this, Symbol.for(...))` in the constructor) and add a matching `is*` guard built on `hasInstanceof` when introducing a new client or error class (see [architecture.md](architecture.md#cross-realm-instanceof-instanceof-marker-chain)).
- Keep the public surface intentional: only export from `src/index.ts` what consumers should use.
