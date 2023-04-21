/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { withBase, withQuery } from 'ufo';
import type { ClientErrorCreateContext } from './error/type';
import { Headers, fetch } from './fetch';

import { MethodName, ResponseType } from './constants';
import type {
    HookErrorFn,
    HookFn,
    HookOptions,
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
import {
    HookManager,
    HookName,
} from './hook';
import {
    detectResponseType,
    isResponse,
} from './response';
import {
    extendRequestOptionsWithDefaults,
    isRequestPayloadSupported,
} from './request';
import { createClientError } from './error';
import type { AuthorizationHeader } from './header';
import { HeaderName, stringifyAuthorizationHeader } from './header';

export class Client {
    readonly '@instanceof' = Symbol.for('BaseClient');

    public defaults : RequestBaseOptions;

    protected headers : Headers;

    protected hookManager : HookManager;

    // ---------------------------------------------------------------------------------

    constructor(input?: RequestBaseOptions) {
        input = input || {};

        this.defaults = extendRequestOptionsWithDefaults(input || {});
        this.headers = new Headers(this.defaults.headers);

        this.hookManager = new HookManager();
    }

    // ---------------------------------------------------------------------------------

    /**
     * Return base url
     *
     * @return string
     */
    public getBaseURL(): string | undefined {
        return this.defaults.baseURL;
    }

    /**
     * Overwrite existing base url.
     *
     * @param url
     */
    public setBaseURL(url: string) {
        this.defaults.baseURL = url;

        return this;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Set a header for all upcoming requests.
     *
     * @param key
     * @param value
     */
    public setHeader(key: string, value: any) {
        this.headers.set(key, value);

        return this;
    }

    /**
     * Get a header for all upcoming requests.
     *
     * @param key
     */
    public getHeader(key: string) {
        return this.headers.get(key);
    }

    /**
     * Unset a specific for all upcoming requests.
     *
     * @param key
     */
    public unsetHeader(key: string) {
        if (this.headers.has(key)) {
            this.headers.delete(key);
        }

        return this;
    }

    /**
     * Unset all defined headers for the upcoming requests.
     */
    public unsetHeaders() {
        this.headers.forEach((_value, key) => {
            this.headers.delete(key);
        });

        return this;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Set an authorization header (basic, api-key, bearer).
     *
     * @param options
     */
    public setAuthorizationHeader(options: AuthorizationHeader) {
        this.setHeader(HeaderName.AUTHORIZATION, stringifyAuthorizationHeader(options));

        return this;
    }

    /**
     * Get authorization header.
     */
    public getAuthorizationHeader() {
        const header = this.getHeader(HeaderName.AUTHORIZATION);
        if (header !== null) {
            return header;
        }

        return undefined;
    }

    /**
     * Unset an authorization header.
     */
    public unsetAuthorizationHeader() {
        this.unsetHeader(HeaderName.AUTHORIZATION);

        return this;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Make a custom request.
     *
     * @param config
     */
    public async request<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(config: RequestOptions<RT>): Promise<R> {
        const headers = new Headers(config.headers);

        this.headers.forEach((value, key) => {
            if (!headers.has(key)) {
                headers.set(key, value);
            }
        });

        const baseURL = config.baseURL || this.defaults.baseURL;
        let options : RequestOptions<RT> = {
            ...this.defaults as RequestBaseOptions<RT>,
            ...config,
            headers,
            url: baseURL ? withBase(config.url, baseURL) : config.url,
        };

        if (options.query || options.params) {
            options.url = withQuery(options.url, {
                ...options.params,
                ...options.query,
            });
        }

        options = await this.hookManager.callReqHook(
            options,
        ) as RequestOptions<RT>;

        if (options.transform) {
            const transformers = Array.isArray(options.transform) ?
                options.transform :
                [options.transform];

            for (let i = 0; i < transformers.length; i++) {
                const transformer = transformers[i];
                options.body = transformer(
                    options.body,
                    options.headers as Headers,
                );
            }
        }

        const handleError = async (
            step: 'request' | 'response',
            ctx: ClientErrorCreateContext,
        ) : Promise<R> => {
            const error = createClientError(ctx);

            if (Error.captureStackTrace) {
                Error.captureStackTrace(error);
            }

            let output : RequestOptions | Response | undefined;
            if (step === 'request') {
                output = await this.hookManager.callErrorHook(HookName.REQUEST_ERROR, error);
            } else {
                output = await this.hookManager.callErrorHook(HookName.RESPONSE_ERROR, error);
            }

            if (output) {
                if (isResponse(output)) {
                    return output as R;
                }

                return this.request(output);
            }

            throw error;
        };

        let response : Response<ResponseData<RT, T>>;

        try {
            if (!isRequestPayloadSupported(options.method)) {
                delete options.body;
            }

            const { url, ...data } = options;

            response = await fetch(url, data as RequestInit);
        } catch (error: any) {
            return handleError('request', {
                request: options,
                ...(error instanceof Error ? { error } : {}),
            });
        }

        const responseType = options.responseType ||
            detectResponseType(response.headers.get(HeaderName.CONTENT_TYPE));

        let data : ResponseData<RT, T>;

        switch (responseType) {
            case ResponseType.STREAM: {
                data = response.body as ResponseData<RT, T>;
                break;
            }
            case ResponseType.BLOB: {
                data = await response.blob() as ResponseData<RT, T>;
                break;
            }
            case ResponseType.ARRAY_BUFFER: {
                data = await response.arrayBuffer() as ResponseData<RT, T>;
                break;
            }
            case ResponseType.TEXT: {
                data = await response.text() as ResponseData<RT, T>;
                break;
            }
            default: {
                const temp = await response.text();
                try {
                    data = JSON.parse(temp);
                } catch (e) {
                    data = temp as ResponseData<RT, T>;
                }
            }
        }

        Object.defineProperty(response, 'data', {
            get() {
                return data;
            },
            set(value: RT) {
                this.data = value;
            },
        });

        if (
            response.status >= 400 &&
            response.status < 600
        ) {
            return handleError('response', {
                response,
                request: options,
            });
        }

        return await this.hookManager.callResHook(response) as R;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Request a resource with the GET method.
     *
     * @param url
     * @param config
     */
    public get<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.GET,
            url,
        });
    }

    // ---------------------------------------------------------------------------------

    /**
     * Delete a resource with the DELETE method.
     *
     * @param url
     * @param config
     */
    public delete<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.DELETE,
            url,
        });
    }

    // ---------------------------------------------------------------------------------

    /**
     * Make a verification resource with the HEAD method.
     *
     * @param url
     * @param config
     */
    public head<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.HEAD,
            url,
        });
    }

    // ---------------------------------------------------------------------------------

    /**
     * Create a resource with the POST method.
     *
     * @param url
     * @param body
     * @param config
     */
    public post<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.POST,
            url,
            body,
        });
    }

    // ---------------------------------------------------------------------------------

    /**
     * Update a resource with the PUT method.
     *
     * @param url
     * @param body
     * @param config
     */
    public put<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.PUT,
            url,
            body,
        });
    }

    // ---------------------------------------------------------------------------------

    /**
     * Update a resource with the PATCH method.
     *
     * @param url
     * @param body
     * @param config
     */
    public patch<
        T = any,
        RT extends `${ResponseType}` = `${ResponseType.JSON}`,
        R = Response<ResponseData<RT, T>>,
    >(url: string, body?: any, config?: RequestBaseOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.PATCH,
            url,
            body,
        });
    }

    //---------------------------------------------------------------------------------

    /**
     * Register a hook fn.
     *
     * @param name
     * @param fn
     */

    on(
        name: `${HookName.REQUEST}`,
        fn: HookReqFn
    ) : number;

    on(
        name: `${HookName.RESPONSE}`,
        fn: HookResFn
    ) : number;

    on(
        name: `${HookName.RESPONSE_ERROR}` | `${HookName.REQUEST_ERROR}`,
        fn: HookErrorFn
    ) : number;

    on(name: `${HookName}`, fn: HookFn) : number {
        const options : HookOptions = {};
        if (
            name === HookName.REQUEST_ERROR ||
            name === HookName.RESPONSE_ERROR
        ) {
            options.continueOnError = true;
            options.returnOnResponse = true;
        }

        this.hookManager.setOptions(name, options);

        return this.hookManager.hook(name, fn);
    }

    /**
     * Remove single or specific hook fn(s).
     *
     * @param name
     * @param fn
     */
    off(name: `${HookName}`, fn?: HookFn | number) : this {
        if (typeof fn === 'undefined') {
            this.hookManager.removeHooks(name);

            return this;
        }

        this.hookManager.removeHook(name, fn);
        return this;
    }
}
