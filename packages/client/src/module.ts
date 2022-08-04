/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios, { AxiosDefaults } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { ClientDriverInstance, ClientRequestConfig, ClientResponse } from './type';
import { Config } from './config';
import { AuthorizationHeader, stringifyAuthorizationHeader } from './header';

export class Client {
    public driver: ClientDriverInstance;

    /**
     * API Service
     *
     * @param config
     */
    constructor(config?: Config) {
        config ??= {};

        const client = axios.create(config.driver);

        if (config.retry) {
            let retryConfig : IAxiosRetryConfig = {};

            if (typeof config.retry !== 'boolean') {
                retryConfig = config.retry;
            }

            axiosRetry(client, retryConfig);
        }

        this.driver = client;
    }

    // ---------------------------------------------------------------------------------

    public setDriver(client: ClientDriverInstance) {
        this.driver = client;
    }

    /**
     * Return driver config.
     *
     * @return AxiosDefaults<any>
     */
    get config() : AxiosDefaults<any> {
        return this.driver.defaults;
    }

    /**
     * Return base url
     *
     * @param config
     *
     * @return string
     */
    public getUri(config?: ClientRequestConfig): string {
        return this.driver.getUri(config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Set a header for all upcoming requests.
     *
     * @param key
     * @param value
     */
    public setHeader(key: string, value: string) {
        this.driver.defaults.headers.common[key] = value;

        return this;
    }

    /**
     * Unset a specific for all upcoming requests.
     *
     * @param key
     */
    public unsetHeader(key: string) {
        if (key in this.driver.defaults.headers.common) {
            delete this.driver.defaults.headers.common[key];
        }

        return this;
    }

    /**
     * Unset all defined headers for the upcoming requests.
     */
    public resetHeader() {
        this.driver.defaults.headers.common = {};

        return this;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Set an authorization header (basic, api-key, bearer).
     *
     * @param options
     */
    public setAuthorizationHeader(options: AuthorizationHeader) {
        this.setHeader('Authorization', stringifyAuthorizationHeader(options));

        return this;
    }

    /**
     * Unset an authorization header.
     */
    public unsetAuthorizationHeader() {
        this.unsetHeader('Authorization');

        return this;
    }

    // ---------------------------------------------------------------------------------

    /**
     * Make a custom request.
     *
     * @param config
     */
    public request<T = any, R = ClientResponse<T>, C = any>(config: ClientRequestConfig<C>): Promise<R> {
        return this.driver.request(config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Request a resource with the GET method.
     *
     * @param url
     * @param config
     */
    public get<T = any, R = ClientResponse<T>, C = any>(url: string, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.get(url, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Delete a resource with the DELETE method.
     *
     * @param url
     * @param config
     */
    public delete<T = any, R = ClientResponse<T>, C = any>(url: string, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.delete(url, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Make a verification resource with the HEAD method.
     *
     * @param url
     * @param config
     */
    public head<T = any, R = ClientResponse<T>, C = any>(url: string, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.head(url, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Create a resource with the POST method.
     *
     * @param url
     * @param data
     * @param config
     */
    public post<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.post(url, data, config);
    }

    /**
     * Create a resource with the POST method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public postForm<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.postForm(url, data, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Update a resource with the PUT method.
     *
     * @param url
     * @param data
     * @param config
     */
    public put<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.put(url, data, config);
    }

    /**
     * Update a resource with the PUT method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public putForm<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.putForm(url, data, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Update a resource with the PATCH method.
     *
     * @param url
     * @param data
     * @param config
     */
    public patch<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.patch(url, data, config);
    }

    /**
     * Update a resource with the PATCH method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public patchForm<T = any, R = ClientResponse<T>, C = any>(url: string, data?: any, config?: ClientRequestConfig<C>): Promise<R> {
        return this.driver.patchForm(url, data, config);
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a response interceptor.
     *
     * @param onFulfilled
     * @param onRejected
     */
    public mountResponseInterceptor(
        onFulfilled: (value: ClientResponse<any>) => any | Promise<ClientResponse<any>>,
        onRejected: (error: any) => any,
    ) : number {
        return this.driver.interceptors.response.use(onFulfilled, onRejected);
    }

    /**
     * Unmount a response interceptor.
     *
     * @param id
     */
    public unmountResponseInterceptor(id: number) {
        this.driver.interceptors.response.eject(id);

        return this;
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a request interceptor.
     *
     * @param onFulfilled
     * @param onRejected
     */
    public mountRequestInterceptor(
        onFulfilled: (value: ClientRequestConfig) => any | Promise<ClientRequestConfig>,
        onRejected: (error: any) => any,
    ) : number {
        return this.driver.interceptors.request.use(onFulfilled, onRejected);
    }

    /**
     * Unmount a request interceptor.
     *
     * @param id
     */
    public unmountRequestInterceptor(id: number) {
        this.driver.interceptors.request.eject(id);

        return this;
    }
}
