# Hooks

It is possible to intercept [requests](#request) or [responses](#response) before and after they are processed.
Hooks can be used, for example, to update an access token if a request fails due to the fact that the token has expired.

## Request

```typescript
import client, { ClientError, RequestOptions } from 'hapic';

client.on('request', (options: RequestOptions) => {
    // Do something with the request options before the request is sent
    options.transform = (data, headers) => {
        headers.set(HeaderName.AUTHORIZATION, 'Bearer foo');

        return data;
    };

    return options;
});

client.on('requestError', (error: ClientError) => {
    // Do something with the request error
    throw error;
})
```

## Response

```typescript
import client, { ClientError, Response } from 'hapic';

client.on('response', (res: Response) => {
    // Any status code that is not in the range 400-599 triggers this function.
    // Do something with the response data

    return res;
})

import client, { ClientError, Response } from 'hapic';

client.on('responseError', (error: ClientError) => {
    // Any status code that is in the range 400-599 triggers this function.
    // Do something with the response error

    return res;
})
```

## Unsubscribe

The hook can also be removed in the following way:

```typescript
import client from 'hapic';

const hook = client.on('xxx', () => {
    // ...
});

client.off(hook);
```
