/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from '../../constants';
import type { ResponseTransformer } from '../response';

export type RequestInit = globalThis.RequestInit;
export type RequestInfo = globalThis.RequestInfo;

export type RequestTransformer = (data: any, headers: Headers) => any;
export type RequestOptions<R extends `${ResponseType}` = `${ResponseType.JSON}`> = Omit<RequestInit, 'body'> & {
    baseURL?: string,
    body?: RequestInit['body'] | Record<string, any>,
    responseType?: R,
    responseTransform?: ResponseTransformer | ResponseTransformer[],
    params?: Record<string, any>,
    query?: Record<string, any>,
    transform?: RequestTransformer | RequestTransformer[]
};

export type RequestOptionsWithURL<R extends `${ResponseType}` = `${ResponseType}`> = RequestOptions<R> & {
    url: string
};
