# hapic — Agent Guide

**hapic** ("**H**TTP **API** **C**lient") is a tiny, fetch-based HTTP client library and a family of service-specific clients built on top of it. The base `hapic` package provides a thin wrapper around `fetch` with request/response hooks, transformers, authorization helpers, proxy support, and automatic error throwing on non-2xx responses. Sibling packages (`@hapic/harbor`, `@hapic/loki`, `@hapic/oauth2`, `@hapic/vault`, `@hapic/victorialogs`) extend the base client with typed, domain-oriented APIs for specific backends. Everything runs in Node.js, the browser, and worker environments.

## Quick Reference

```bash
# Setup
npm ci

# Development
npm run build          # nx run-many -t build — build all packages with tsdown (ESM + .d.mts)
npm run test           # nx run-many -t test — run all package test suites (Vitest)
npm run lint           # eslint (flat config)
npm run lint:fix       # eslint --fix
```

- **Development Node.js**: 24.15+ on the 24.x line, or 26+ (CI runs on 24). Published runtime requirements are declared in each package manifest.
- **Package manager**: npm (workspaces — `packages/*`)
- **Build orchestration**: [Nx](https://nx.dev) (`build`, `lint`, `test` are cached; `build` depends on `^build`)

All publishable packages are libraries in `packages/`; `packages/docs` is a private VitePress documentation site. There are no runnable applications and no CLI binaries.

## Documentation

The `packages/docs` directory contains the VitePress documentation site published to [hapic.tada5hi.net](https://hapic.tada5hi.net). When changing user-facing behavior (client options, request methods, hooks, instance management), **update the corresponding docs pages** under `packages/docs/src/guide/`.

```bash
npm run dev   --workspace=packages/docs   # run the docs site locally
npm run build --workspace=packages/docs   # build the docs site for production
```

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Workspace layout, package inventory, dependency layers, and per-package directory conventions
- **[Architecture](.agents/architecture.md)** — Base `Client`, hook pipeline, domain `*API` / `BaseAPI` pattern, singleton instance management, and cross-realm `@instanceof` checks
- **[Testing](.agents/testing.md)** — Vitest setup, per-package config, coverage thresholds, and the CI test matrix
- **[Conventions](.agents/conventions.md)** — Code style, naming, tooling (ESLint/TS/tsdown/Nx), Conventional Commits, and the release-please flow

### Writing agent docs

Keep the guides factual and focused on contracts a future change could silently break.

- Keep existing commands, paths and factual descriptions current. Add guide content only for an invariant or cross-cutting rule. Put defect stories and verification details in the PR, and user-facing changes in the documentation site or release notes.
- Keep subsystem detail in `.agents/topics/` and link it from the relevant guide; do not import topic files into `CLAUDE.md`.
- Describe current behavior and cite issues or PRs, rather than local plan files or a running history of completed work.
- `npm run lint` enforces the shared config's agent-doc size, import-budget and history checks. Preserve the critical contracts when splitting a guide.

## Commits, Issues & Pull Requests

- Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint (`@tada5hi/commitlint-config`) via a Husky `commit-msg` hook. Releases and changelogs are derived from commit messages by release-please. See [Conventions](.agents/conventions.md#commit-convention).
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.
