# Request Methods

Every request ultimately runs through `Client.request(config)`, but you'll rarely call it directly. The method shortcuts cover the common HTTP verbs and read more naturally.

All of them return a `Promise<Response>` whose `data` holds the decoded body. They throw a [`ClientError`](/guide/errors) for non-2xx responses.

## The shortcuts

| Method | Signature | Sends a body? |
|--------|-----------|:-------------:|
| `get`    | `get(url, config?)`        | — |
| `delete` | `delete(url, config?)`     | — |
| `head`   | `head(url, config?)`       | — |
| `post`   | `post(url, body?, config?)`| ✓ |
| `put`    | `put(url, body?, config?)` | ✓ |
| `patch`  | `patch(url, body?, config?)`| ✓ |

For methods that don't carry a payload (`get` / `delete` / `head`), any body is stripped before dispatch.

### Reading data — `GET`

```typescript
import { useClient } from 'hapic';

const { data } = await useClient().get('users');
// data → [{ id: 1, name: 'Peter' }, …]
```

### Creating — `POST`

The body is the second argument. Plain objects are serialized to JSON and the `Content-Type` header is set for you.

```typescript
const { data } = await useClient().post('users', { name: 'Peter' });
// data → { id: 3, name: 'Peter' }
```

### Replacing & updating — `PUT` / `PATCH`

```typescript
await useClient().put('users/3', { id: 3, name: 'Hans' });
await useClient().patch('users/3', { name: 'Hans P.' });
```

### Removing — `DELETE`

```typescript
await useClient().delete('users/3');
```

### Checking — `HEAD`

`HEAD` fetches headers without a body — handy for existence or metadata checks.

```typescript
const res = await useClient().head('users/3');
console.log(res.status, res.headers.get('etag'));
```

## Typing the response

Pass a generic to type `response.data`:

```typescript
interface User { id: number; name: string }

const { data } = await useClient().get<User[]>('users');
//      ^? User[]

const created = await useClient().post<User>('users', { name: 'Peter' });
//    ^? Response<User>
```

## Query parameters

Use `query` (or its alias `params`) to build a query string. Both are merged and URL-encoded; `bigint` values are stringified automatically.

```typescript
await useClient().get('users', {
    query: { page: 2, page_size: 25, sort: 'name' },
});
// → GET users?page=2&page_size=25&sort=name
```

## Per-request configuration

The trailing `config` argument accepts the same [`RequestBaseOptions`](/guide/client#configuration-options) as the constructor — so you can override the `baseURL`, add headers, change the `responseType`, attach an `AbortSignal`, and more, for a single call:

```typescript
const controller = new AbortController();

const { data } = await useClient().get('report.csv', {
    responseType: 'text',
    headers: { accept: 'text/csv' },
    signal: controller.signal,
});
```

## The generic `request`

When you need full control — or a verb without a shortcut — call `request` directly with a `url` and `method`:

```typescript
import { MethodName, useClient } from 'hapic';

const { data } = await useClient().request({
    method: MethodName.POST,
    url: 'users',
    body: { name: 'Peter' },
    query: { dryRun: true },
});
```

`MethodName` is an exported enum (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`) — or pass the plain string.

## What's next

- [Responses](/guide/responses) — the `Response` object and how bodies are decoded.
- [Transformers](/guide/transformers) — reshape the body before it's sent.
