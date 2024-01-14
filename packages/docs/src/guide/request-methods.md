# Request Methods

For the sake of simplicity, alias names have been provided for all supported request methods.

**`DELETE`**
```typescript
import client from 'hapic';

const { data } = await client.delete('users/1');
console.log(data);
// [{ id: 1, name: 'xxx' }]
```

**`GET`**
```typescript
import client from 'hapic';

let { data } = await client.get('users');
console.log(data);
// [{ id: 2, name: 'Peter' }]
```

**`PATCH`**
```typescript
import client from 'hapic';

let { data } = await client.patch('users/2', { name: 'Peter P.' });
console.log(data);
// [{ id: 2, name: 'Peter P.' }]
```

**`POST`**
```typescript
import client from 'hapic';

let { data } = await client.post('users', { name: 'Hans' });
console.log(data);
// [{ id: 3, name: 'Hans' }]
```

**`PUT`**
```typescript
import client from 'hapic';

let { data } = await client.put('users/3', { id: 3, name: 'Hans' });
console.log(data);
// [{ id: 3, name: 'Hans' }]
