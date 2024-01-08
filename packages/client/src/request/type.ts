/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from 'node-fetch-native/proxy';
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
     */
    responseType?: R,
    /**
     * A function or array of functions to transform the response data.
     */
    responseTransform?: ResponseTransformer | ResponseTransformer[],
    /**
     * Query string parameters for the request.
     */
    params?: Record<string, any>,
    /**
     * Activate or deactivate the use of proxies or enter customized options.
     *
     * default: true
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
     * Proxy agent configuration (Node.JS only).
     */
    agent?: ((url: URL) => any) | any
};

export type RequestOptions<R extends `${ResponseType}` = `${ResponseType}`> = RequestBaseOptions<R> & {
    url: string
};
