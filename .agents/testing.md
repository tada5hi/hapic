# Testing

## Setup

- **Runner**: [Jest](https://jestjs.io/) with [`ts-jest`](https://kulshekhar.github.io/ts-jest/) (TypeScript compiled at test time — no build step required to test source).
- **Test location**: `packages/<pkg>/test/unit/**/*.spec.ts`
- **Config**: `packages/<pkg>/test/jest.config.js` (one per package; `rootDir` is the package root)
- **Environment**: `NODE_ENV=test` (set via `cross-env`), `testEnvironment: 'node'`

`testRegex` matches files under a `/unit/` directory and any `*.spec.ts` / `*.test.ts`.

## Running Tests

```bash
npm run test                                   # nx run-many -t test — all packages
npm run test --workspace=packages/harbor       # a single package
npm run test --workspace=packages/client -- --coverage   # with coverage
cd packages/client && npm run test:coverage    # equivalent, per-package
```

Tests import from the package's `src` directly (e.g. `import { Client } from '../../src'`), so changes are picked up without rebuilding.

## Test Layers

### Unit tests

All current tests are unit tests. They instantiate a `Client`, a service client (e.g. `HarborClient`), or a single domain `*API` directly and assert behavior:

- **Base client** (`packages/client/test/unit/`) — header get/set/unset, authorization header stringifying, baseURL, hook registration/removal, error helpers, inherited-instance behavior.
- **Service clients** — `instance.spec.ts` covers the singleton registry + `connectionString` parsing; `domains/*.spec.ts` cover each domain API's request construction and response shaping.

There are **no integration tests** against live services and **no Docker/infrastructure** requirements — tests run fully in-process.

## Test Helpers & Fixtures

- Shared fixture data lives under `packages/<pkg>/test/data/` (e.g. `packages/client/test/data/`).
- `testPathIgnorePatterns` excludes `writable`, `dist`, and `/unit/mock-util.ts` — name shared helpers `mock-util.ts` (or place them outside `unit/`) so they aren't collected as test suites.

## Testing Philosophy

Tests should assert *expected* behavior based on the client contract and the architecture docs — not merely confirm what the implementation currently does. A failing test may surface a real bug rather than a stale test.

When testing a domain `*API`, prefer constructing the API with a real `Client` (or the service client) and asserting the request/response transformation. The `BaseAPI` accepts either a `Client` or raw `RequestBaseOptions`, so a domain API can be exercised in isolation. Avoid hitting the network — assert on how options/URLs/headers are built and how responses are shaped, using the client's hooks or a stubbed `fetch` where a round-trip is unavoidable.

## Code Coverage

```bash
npm run test:coverage --workspace=packages/client   # reports to packages/client/writable/coverage
```

The base package enforces global thresholds in `packages/client/test/jest.config.js`:

| Metric     | Threshold |
|------------|-----------|
| branches   | 58%       |
| functions  | 77%       |
| lines      | 73%       |
| statements | 73%       |

Coverage is collected from `src/**/*.{ts,tsx,js,jsx}` (excluding `*.d.ts`). Coverage output goes to each package's `writable/coverage/` (git-ignored).

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) runs on push/PR to `master`:

```
install → build → ├─ lint  (npm run lint)
                  └─ tests (matrix: client, harbor, oauth2)  → release (release-please) + docs deploy
```

> **Note:** the CI test matrix only runs `client`, `harbor`, and `oauth2`. `loki`, `vault`, and `victorialogs` have local test suites but are **not** in the CI matrix — run them locally (`npm run test --workspace=packages/<pkg>`) when changing them. A separate `codecov.yml` workflow uploads coverage.

## Writing New Tests

1. Place test files in `packages/<pkg>/test/unit/` with the `.spec.ts` extension (mirror the `src/` path where practical, e.g. `test/unit/domains/project.spec.ts`).
2. Import from `../../src` (or the relative path to source), instantiate the class under test, and assert on observable behavior.
3. Keep the per-package coverage thresholds satisfied (notably for `packages/client`).
4. Run `npm run test --workspace=packages/<pkg>` to verify.
