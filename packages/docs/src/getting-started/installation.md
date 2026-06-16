# Installation

Install the base client:

```bash
npm install hapic --save
```

Or pick one of the service clients — each declares `hapic` as a peer dependency, so install it alongside:

```bash
npm install hapic @hapic/harbor       --save   # Harbor container registry
npm install hapic @hapic/oauth2       --save   # OAuth2 / OpenID Connect
npm install hapic @hapic/vault        --save   # HashiCorp Vault
npm install hapic @hapic/loki         --save   # Grafana Loki
npm install hapic @hapic/victorialogs --save   # VictoriaLogs
```

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js     | `>=16.0.0` |
| TypeScript  | 4.x+ recommended (the library ships its own type declarations) |
| Module format | ESM **and** CommonJS — `main` (`dist/index.cjs`), `module` (`dist/index.mjs`), `types` (`dist/index.d.ts`) |

hapic resolves `fetch`, `Headers`, `Blob`, `FormData`, and `AbortController` from `globalThis` when they exist, and falls back to [`node-fetch-native`](https://www.npmjs.com/package/node-fetch-native) otherwise. There is **no** environment-specific entry point — the same import works in Node.js, the browser, and worker runtimes.

## Importing

The default export is a ready-to-use `Client` instance:

```typescript
import client from 'hapic';

const { data } = await client.get('https://api.example.com/users');
```

The named exports give you the building blocks:

```typescript
import {
    Client,
    createClient,
    useClient,
    ResponseType,
    MethodName,
    HeaderName,
    isClientError,
    isClientErrorWithStatusCode,
} from 'hapic';
```

## Verifying the install

```typescript
import { createClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });
console.log(typeof client.get); // 'function'
```

If the import resolves and your editor picks up the types, you're set. Continue to the [Quick Start](/getting-started/quick-start).
