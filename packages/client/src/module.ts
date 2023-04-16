/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers, fetch } from 'node-fetch-native';
import { withBase, withQuery } from 'ufo';

import { MethodName, ResponseType } from './constants';
import type {
    ClientContext,
    InterceptorErrorHandler, InterceptorHandler,
    RequestOptions,
    RequestOptionsWithURL,
    Response,
    ResponseData,
} from './core';
import {
    InterceptorManager,
    detectResponseType,
    extendRequestOptionsWithDefaults, isRequestPayloadSupported,
} from './core';
import type { ClientError } from './error';
import { ErrorCode, createClientError } from './error';
import type { AuthorizationHeader } from './header';
import { HeaderName, stringifyAuthorizationHeader } from './header';

export class Client {
    readonly '@instanceof' = Symbol.for('BaseClient');

    public defaults : RequestOptions;

    protected headers : Headers;

    protected requestInterceptors : InterceptorManager;

    protected responseInterceptors : InterceptorManager;

    // ---------------------------------------------------------------------------------

    constructor(input?: RequestOptions) {
        input = input || {};

        this.defaults = extendRequestOptionsWithDefaults(input || {});
        this.headers = new Headers(this.defaults.headers);

        this.requestInterceptors = new InterceptorManager();
        this.responseInterceptors = new InterceptorManager();
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
        if (typeof header === 'string') {
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
    >(config: RequestOptionsWithURL<RT>): Promise<R> {
        const headers = new Headers(config.headers);

        this.headers.forEach((value, key) => {
            if (!headers.has(key)) {
                headers.set(key, value);
            }
        });

        const baseURL = config.baseURL || this.defaults.baseURL;
        const context : ClientContext<RT, T> = {
            request: baseURL ? withBase(config.url, baseURL) : config.url,
            options: { ...this.defaults as RequestOptionsWithURL<RT>, ...config, headers },
        };

        if (context.options.query || context.options.params) {
            context.request = withQuery(context.request, {
                ...context.options.params,
                ...context.options.query,
            });
        }

        await this.requestInterceptors.run(context as ClientContext);

        if (context.options.transform) {
            const transformers = Array.isArray(context.options.transform) ?
                context.options.transform :
                [context.options.transform];

            for (let i = 0; i < transformers.length; i++) {
                const transformer = transformers[i];
                context.options.body = transformer(
                    context.options.body,
                    context.options.headers as Headers,
                );
            }
        }

        const handleError = async (
            step: 'request' | 'response',
            ctx: Omit<ClientContext<RT, T>, 'error'> & { error?: Error },
        ) : Promise<R> => {
            const isAbort = (!!ctx.error && ctx.error.name === 'AbortError');

            let code : ErrorCode | undefined;
            if (!ctx.response) {
                if (isAbort) {
                    code = ErrorCode.CONNECTION_ABORTED;
                } else {
                    code = ErrorCode.CONNECTION_CLOSED;
                }
            }

            const error = createClientError({
                ...ctx,
                code,
            });

            if (Error.captureStackTrace) {
                Error.captureStackTrace(error);
            }

            ctx.error = error as ClientError<T>;

            let output : ClientContext | undefined;
            if (step === 'request') {
                output = await this.requestInterceptors.run(ctx as ClientContext);
            } else {
                output = await this.responseInterceptors.run(ctx as ClientContext);
            }

            if (
                output &&
                output.response
            ) {
                return output.response as R;
            }

            throw error;
        };

        let response : Response<ResponseData<RT, T>>;

        try {
            if (!isRequestPayloadSupported(context.options.method)) {
                delete context.options.body;
            }

            response = await fetch(context.request, context.options as RequestInit);
        } catch (error: any) {
            return handleError('request', {
                ...context,
                ...(error instanceof Error ? { error } : {}),
            });
        }

        const responseType = context.options.responseType ||
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
        });

        if (
            response.status >= 400 &&
            response.status < 600
        ) {
            context.response = response;

            return handleError('response', context);
        }

        return response as R;
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
    >(url: string, config?: RequestOptions<RT>): Promise<R> {
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
    >(url: string, config?: RequestOptions<RT>): Promise<R> {
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
    >(url: string, config?: RequestOptions<RT>): Promise<R> {
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
    >(url: string, body?: any, config?: RequestOptions<RT>): Promise<R> {
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
    >(url: string, body?: any, config?: RequestOptions<RT>): Promise<R> {
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
    >(url: string, body?: any, config?: RequestOptions<RT>): Promise<R> {
        return this.request({
            ...(config || {}),
            method: MethodName.PATCH,
            url,
            body,
        });
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a response interceptor.
     *
     * @param interceptor
     */
    public mountResponseInterceptor(interceptor: InterceptorHandler) : number {
        return this.responseInterceptors.registerHandler(interceptor);
    }

    /**
     * Unmount a response interceptor.
     *
     * @param id
     */
    public unmountResponseInterceptor(id: number) {
        this.responseInterceptors.ejectHandler(id);

        return this;
    }

    /**
     * Unmount all response interceptors.
     */
    public unmountResponseInterceptors() {
        this.responseInterceptors.clearHandlers();
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a response error interceptor.
     *
     * @param interceptor
     */
    public mountResponseErrorInterceptor(interceptor: InterceptorErrorHandler) : number {
        return this.responseInterceptors.registerErrorHandler(interceptor);
    }

    /**
     * Unmount a response error interceptor.
     *
     * @param id
     */
    public unmountResponseErrorInterceptor(id: number) {
        this.responseInterceptors.ejectErrorHandler(id);

        return this;
    }

    /**
     * Unmount all error interceptors.
     */
    public unmountResponseErrorInterceptors() {
        this.responseInterceptors.clearErrorHandlers();

        return this;
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a request interceptor.
     *
     * @param interceptor
     */
    public mountRequestInterceptor(interceptor: InterceptorHandler) : number {
        return this.requestInterceptors.registerHandler(interceptor);
    }

    /**
     * Unmount a request interceptor.
     *
     * @param id
     */
    public unmountRequestInterceptor(id: number) {
        this.requestInterceptors.ejectHandler(id);

        return this;
    }

    /**
     * Unmount all request interceptors.
     */
    public unmountRequestInterceptors() {
        this.requestInterceptors.clearHandlers();
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a request error interceptor.
     *
     * @param interceptor
     */
    public mountRequestErrorInterceptor(interceptor: InterceptorHandler) : number {
        return this.requestInterceptors.registerErrorHandler(interceptor);
    }

    /**
     * Unmount a request error interceptor.
     *
     * @param id
     */
    public unmountRequestErrorInterceptor(id: number) {
        this.requestInterceptors.ejectErrorHandler(id);

        return this;
    }

    /**
     * Unmount all request interceptors.
     */
    public unmountRequestErrorInterceptors() {
        this.requestInterceptors.clearErrorHandlers();
    }
}
