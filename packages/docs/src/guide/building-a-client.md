# Building a Service Client

The `@hapic/*` packages aren't magic — each is a thin layer over the base `Client`. This guide shows the pattern so you can build a typed client for *your* API the same way.

## The shape

A service client does three things:

1. **Extend `Client`** so it inherits the whole transport (requests, hooks, headers, instance registry).
2. **Compose domain APIs** — small classes that group related endpoints and route through the shared client.
3. **Apply connection config** — turn a connection string or options into a `baseURL` + auth header.

```
MyClient extends Client
 ├── users:   UserAPI   ┐ each holds a reference back to the client
 └── orders:  OrderAPI  ┘ and issues requests through it
```

## A domain API

Group endpoints into a class that holds a `client` and calls through it. Mirroring the `@hapic/*` packages, give it a `BaseAPI` to hold the client reference:

```typescript
// base.ts
import { type Client, type RequestBaseOptions, createClient, isClient } from 'hapic';

export interface BaseAPIContext {
    client?: Client | RequestBaseOptions;
}

export abstract class BaseAPI {
    protected client!: Client;

    protected constructor(context: BaseAPIContext = {}) {
        this.setClient(context.client);
    }

    setClient(input?: Client | RequestBaseOptions) {
        // accept a ready client, or raw options to build one
        this.client = isClient(input) ? input : createClient(input);
    }
}
```

```typescript
// users.ts
import { BaseAPI } from './base';

interface User { id: number; name: string }

export class UserAPI extends BaseAPI {
    async getMany(): Promise<User[]> {
        const { data } = await this.client.get<User[]>('users');
        return data;
    }

    async getOne(id: number): Promise<User> {
        const { data } = await this.client.get<User>(`users/${id}`);
        return data;
    }

    async create(input: Pick<User, 'name'>): Promise<User> {
        const { data } = await this.client.post<User>('users', input);
        return data;
    }
}
```

::: tip Always route through `this.client`
Domain methods should never call `fetch` directly — going through `this.client` means they inherit your hooks, transformers, auth header, and proxy settings for free.
:::

## The client class

Extend `Client`, instantiate the domain APIs with `this` so they share one transport, and apply any connection config:

```typescript
// module.ts
import { Client, type RequestBaseOptions } from 'hapic';
import { UserAPI } from './users';
import { OrderAPI } from './orders';

export interface ConfigInput {
    request?: RequestBaseOptions;
    connectionString?: string;
}

export class MyClient extends Client {
    public readonly user: UserAPI;
    public readonly order: OrderAPI;

    constructor(input: ConfigInput = {}) {
        super(input.request);                 // hand request options to the base Client

        this.user = new UserAPI({ client: this });   // pass `this` to share the transport
        this.order = new OrderAPI({ client: this });

        if (input.connectionString) {
            this.applyConnectionString(input.connectionString);
        }
    }

    protected applyConnectionString(value: string) {
        // e.g. "user:password@https://api.example.com/"
        const [credentials, host] = value.split('@');
        const [username, password] = credentials.split(':');
        this.setBaseURL(host);
        this.setAuthorizationHeader({ type: 'Basic', username, password });
    }
}
```

Now consumers get a typed surface over the same predictable transport:

```typescript
const client = new MyClient({
    connectionString: 'admin:secret@https://api.example.com/',
});

const users = await client.user.getMany();
const created = await client.order.create({ userId: users[0].id });
```

## Cross-realm `instanceof`

If you publish your client, register its own cross-realm marker in the constructor and ship a matching `isClient` guard so duplicate bundled copies still recognize each other:

```typescript
import { Client, hasInstanceof, markInstanceof } from 'hapic';

export class MyClient extends Client {
    constructor(/* … */) {
        super(/* … */);
        markInstanceof(this, Symbol.for('MyClient'));
    }
}

export function isMyClient(input: unknown): input is MyClient {
    return hasInstanceof(input, Symbol.for('MyClient'));
}
```

Register the marker with `markInstanceof` — do **not** assign an `'@instanceof'` class field. The base `Client` stores the marker chain in a non-writable property, so a field initializer of that name throws at construction. Because the chain accumulates one marker per ancestor, `MyClient` is matched by both `isMyClient` and the base `isClient`. See [Instance Registry](/guide/instance#cross-realm-isclient) for why this matters.

## A singleton registry for your client

Rather than re-implementing `createClient` / `useClient` / `setClient` / `hasClient` / `unsetClient` / `isClient` by hand, build them with `createClientRegistry`. You supply only how to construct your client and the marker symbol that identifies it; the factory returns the six functions, backed by a private keyed map:

```typescript
// instance.ts
import { createClientRegistry } from 'hapic';
import { MyClient, type ConfigInput } from './module';

const MY_CLIENT_INSTANCE = Symbol.for('MyClient');

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<MyClient, ConfigInput>({
    create: (input) => new MyClient(input),
    id: MY_CLIENT_INSTANCE,
});
```

Use the **same symbol** you pass to `markInstanceof` in the constructor as the registry's `id` — `isClient` resolves entirely through `hasInstanceof(input, id)`, so a mismatched symbol silently breaks recognition. A one-line test guards against it:

```typescript
import { createClient, isClient } from './instance';

expect(isClient(createClient())).toBe(true);
expect(isClient({})).toBe(false);
```

This is exactly how every `@hapic/*` package builds its registry — see [Instance Registry](/guide/instance) for the consumer-facing behavior.

## Standalone domain APIs

Because `BaseAPI` accepts either a `Client` or raw options, a domain API can also be used on its own — useful in tests or when you only need one slice of an API:

```typescript
const users = new UserAPI({ client: { baseURL: 'https://api.example.com/' } });
await users.getOne(1);
```

This is exactly how the `@hapic/*` packages are built — read the [Packages](/packages/) section to see the pattern applied to Harbor, Vault, Loki, VictoriaLogs, and OAuth2.
