/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from './constants';
import type { AuthorizationHeader } from './header';
import type {
    HookErrorFn,
    HookFn,
    HookName,
    HookReqFn,
    HookResFn,
} from './hook';
import type {
    RequestBaseOptions,
    RequestOptions,
} from './request';
import type {
    Response,
    ResponseData,
} from './response';
import type { ITransport } from './transport';

/**
 * Fully-resolved options for a {@link Client}.
 */
export type ClientOptions = RequestBaseOptions & {
    /**
     * The transport used to dispatch requests.
     *
     * default: a `FetchTransport` bound to the cross-environment fetch.
     */
    transport: ITransport
};

/**
 * Options accepted when constructing a client. Everything is optional; the
 * transport defaults to a `FetchTransport`.
 */
export type ClientOptionsInput = Partial<ClientOptions>;

/**
 * Public contract implemented by the base `Client` (and, transitively, every
 * `@hapic/*` service client).
 *
 * Prefer this interface over the concrete `Client` class wherever a client is
 * referenced as a *type* (domain APIs, registry generics, helper signatures) so
 * consumers depend on the request surface rather than a specific class — which
 * also keeps things sound across duplicate-package / cross-realm boundaries.
 */
export interface IClient {
    /**
     * The merged, default request options applied to every request.
     */
    defaults: RequestBaseOptions;

    // ---------------------------------------------------------------------------------

    /**
     * Return the base url.
     */
    getBaseURL(): string | undefined;

    /**
     * Overwrite the existing base url.
     */
    setBaseURL(url: string): this;

    // ---------------------------------------------------------------------------------

    /**
     * Set a header for all upcoming requests.
     */
    setHeader(key: string, value: any): this;

    /**
     * Get a header for all upcoming requests.
     */
    getHeader(key: string): string | null;

    /**
     * Unset a specific header for all upcoming requests.
     */
    unsetHeader(key: string): this;

    /**
     * Unset all defined headers for the upcoming requests.
     */
    unsetHeaders(): this;

    // ---------------------------------------------------------------------------------

    /**
     * Set an authorization header (basic, api-key, bearer).
     */
    setAuthorizationHeader(options: AuthorizationHeader): this;

    /**
     * Get the authorization header.
     */
    getAuthorizationHeader(): string | undefined;

    /**
     * Unset the authorization header.
     */
    unsetAuthorizationHeader(): this;

    // ---------------------------------------------------------------------------------

    /**
     * Make a custom request.
     */
    request<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(config: RequestOptions<RT>): Promise<R>;

    /**
     * Request a resource with the GET method.
     */
    get<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R>;

    /**
     * Delete a resource with the DELETE method.
     */
    delete<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R>;

    /**
     * Make a verification request with the HEAD method.
     */
    head<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R>;

    /**
     * Create a resource with the POST method.
     */
    post<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R>;

    /**
     * Update a resource with the PUT method.
     */
    put<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R>;

    /**
     * Update a resource with the PATCH method.
     */
    patch<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R>;

    // ---------------------------------------------------------------------------------

    /**
     * Register a hook fn.
     */
    on(name: `${HookName.REQUEST}`, fn: HookReqFn): number;
    on(name: `${HookName.RESPONSE}`, fn: HookResFn): number;
    on(name: `${HookName.RESPONSE_ERROR}` | `${HookName.REQUEST_ERROR}`, fn: HookErrorFn): number;

    /**
     * Remove single or specific hook fn(s).
     */
    off(name: `${HookName}`, fn?: HookFn | number): this;
}
