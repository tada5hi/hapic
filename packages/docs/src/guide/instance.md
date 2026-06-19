# Instance Registry

Most apps want **one** configured client, reused everywhere — not a fresh one per module. hapic ships a small singleton registry, keyed by name, so you can configure a client once and reach it from anywhere.

The same six functions are exported by the base package **and** by every `@hapic/*` service package, with identical semantics — they're all produced by one factory, `createClientRegistry`, so you get the same registry for [your own client](/guide/building-a-client#a-singleton-registry-for-your-client).

## The functions

```typescript
import {
    createClient,  // construct a new Client (no registration)
    useClient,     // get-or-create the singleton for a key
    setClient,     // register a client under a key
    hasClient,     // does a singleton exist for a key?
    unsetClient,   // remove the singleton for a key
    isClient,      // type guard / cross-realm instanceof check
} from 'hapic';
```

| Function | Signature | Behavior |
|----------|-----------|----------|
| `createClient` | `(input?: RequestBaseOptions) => IClient` | Builds a new `Client`. Does **not** register it. |
| `useClient` | `(key?: string) => IClient` | Returns the client registered under `key`, creating an empty one on first use. Default key: `'default'`. |
| `setClient` | `(client: IClient, key?: string) => IClient` | Registers `client` under `key` and returns it. |
| `hasClient` | `(key?: string) => boolean` | Whether a client is registered under `key`. |
| `unsetClient` | `(key?: string) => void` | Removes the client registered under `key`. |
| `isClient` | `(input: unknown) => input is IClient` | `true` for a `Client`, using a cross-realm symbol check. |

## Configure once, use everywhere

Register a configured client at startup:

```typescript
// setup.ts
import { createClient, setClient } from 'hapic';

const client = createClient({ baseURL: 'https://api.example.com/' });
client.setAuthorizationHeader({ type: 'Bearer', token: process.env.API_TOKEN! });

setClient(client);
```

Then reach it from any module — no need to thread the instance around:

```typescript
// users.ts
import { useClient } from 'hapic';

export async function getUsers() {
    const { data } = await useClient().get('users');
    return data;
}
```

`useClient()` is **get-or-create**: if nothing is registered yet, it lazily creates an empty client for the key. That makes it safe to call before setup in tests, though you'll usually `setClient()` first.

## Multiple named clients

Pass a key to keep separate clients side by side — for example one per upstream service:

```typescript
import { createClient, setClient, useClient } from 'hapic';

setClient(createClient({ baseURL: 'https://auth.example.com/' }), 'auth');
setClient(createClient({ baseURL: 'https://api.example.com/'  }), 'api');

await useClient('auth').post('login', { username, password });
await useClient('api').get('resources');
```

## Cross-realm `isClient`

A consumer may end up with two bundled copies of hapic — a plain `instanceof Client` would then return `false` for a client created by the "other" copy. To guard against that, every client registers a cross-realm marker in its constructor (`markInstanceof(this, Symbol.for(...))`), and `isClient` checks that marker chain:

```typescript
import { isClient } from 'hapic';

isClient(useClient());     // true
isClient({});              // false
```

Service packages register their own marker *in addition* to the inherited `Client` marker (e.g. `markInstanceof(this, Symbol.for('@hapic/oauth2/OAuth2Client'))`) and ship a matching `isClient`. Because the marker chain accumulates one entry per ancestor, the base `isClient` recognises a service client too. See [Building a Service Client](/guide/building-a-client).
