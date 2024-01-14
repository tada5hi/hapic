# Instance

To create a client instance, a configuration can be provided,
like described in the following:

```typescript
import { Client } from "hapic";

const client = new Client({
    baseURL: 'http://localhost:3000/',
    credentials: 'include',
    proxy: true
});
```

These are the available options for making requests and creating a client:
The type for the configuration object can be inspected under [src/request/type.ts](https://github.com/tada5hi/hapic/tree/master/packages/client/src/request/type.ts).

::: tip
The configuration object extends the [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options) type of the globalThis object.
This means that these options are also available.
:::

```typescript
export default {
    /**
     * globalThis.RequestInit
     *
     * A Headers object, an object literal, or an array of two-item arrays to set request's headers.
     */
    headers: {
        'Authorization': 'Bearer foo'
    },
    /**
     * globalThis.RequestInit
     *
     * A string indicating whether credentials will be sent with the request always, never,
     * or only when sent to a same-origin URL. Sets request's credentials.
     */
    credentials: 'include',
    /**
     * A string to set request's method.
     */
    method: 'GET',
    /**
     * The base URL for the HTTP endpoints.
     */
    baseURL: 'https://example.com/',
    /**
     * The request body.
     */
    body: {
        foo: 'bar'
    },
    /**
     * The desired response type (json, .
     *
     * default: CONTENT_TYPE header
     */
    responseType: 'json',
    /**
     * A function or array of functions to transform the response data.
     */
    responseTransform: [
        (data) => {
            // transform the data
            return data;
        }
    ],
    /**
     * Query string parameters for the request.
     */
    params: {
        id: 123
    },
    /**
     * Activate or deactivate the use of proxies or enter customized options.
     * By default, https_proxy, http_proxy, HTTPS_PROXY, and HTTP_PROXY environment variables will be checked and used
     *
     * default: true (disable with false)
     */
    proxy: {
        url: 'http://localhost:9080', // overrite env variables
        noProxy: '.foo.bar'
    },
    /**
     * Query string parameters for the request.
     */
    query: {
        id: 123
    },
    /**
     * A function or array of functions to transform the request data.
     */
    transform: [
        (data) => {
            // transform the data
            return data;
        }
    ],
};
```
