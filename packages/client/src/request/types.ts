/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../types';
import type { ResponseType } from '../constants';
import type { ResponseTransformer } from '../response';

export type RequestInit = globalThis.RequestInit;
export type RequestInfo = globalThis.RequestInfo;

export type RequestTransformer = (data: any, headers: Headers) => any;
export type RequestBaseOptions<R extends `${ResponseType}` = `${ResponseType.JSON}`> = Omit<RequestInit, 'body'> & {
    /**
     * The base URL for the HTTP endpoints.
     */
    baseURL?: string,
    /**
     * The request body.
     */
    body?: RequestInit['body'] | Record<string, any>,
    /**
     * The desired response type.
     *
     * default: CONTENT_TYPE header
     */
    responseType?: R,
    /**
     * A function or array of functions to transform the response data.
     * Each receives the decoded data, the response headers and the status;
     * it also runs on 4xx/5xx bodies, where a throwing function leaves
     * the body untransformed.
     */
    responseTransform?: ResponseTransformer | ResponseTransformer[],
    /**
     * Query string parameters for the request.
     */
    params?: Record<string, any>,
    /**
     * Activate or deactivate the use of proxies or enter customized options.
     * By default, https_proxy, http_proxy, HTTPS_PROXY, and HTTP_PROXY environment variables will be checked and used.
     *
     * default: true (disable with false)
     */
    proxy?: ProxyOptions | boolean,
    /**
     * Query string parameters for the request.
     */
    query?: Record<string, any>,
    /**
     * A function or array of functions to transform the request data.
     */
    transform?: RequestTransformer | RequestTransformer[],
    /**
     * Abort the request after this many milliseconds.
     * Only a finite number above 0 arms it; anything else means no timeout.
     * A fraction is rounded up and a value above 2147483647 (the timer
     * limit, about 24.8 days) is capped to it.
     * It covers reading the response body, so for a stream response it keeps
     * running while the stream is consumed.
     * A timed-out request rejects with the error code ETIMEDOUT, as does a
     * caller signal aborted with a TimeoutError (e.g. AbortSignal.timeout());
     * any other abort through the caller signal keeps ECONNABORTED.
     * A per-request value of undefined keeps the client default.
     *
     * default: undefined (no timeout)
     */
    timeout?: number,
    /**
     * Proxy agent configuration (Node.js only).
     */
    agent?: ((url: URL) => any) | any
};

export type RequestOptions<R extends `${ResponseType}` = `${ResponseType}`> = RequestBaseOptions<R> & {
    url: string
};
