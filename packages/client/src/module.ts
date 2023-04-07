/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axiosRetry from 'axios-retry';
import { buildConfig } from './config';
import type {
    Driver, DriverRequestConfig, DriverResponse, DriverRetryConfig,
} from './type';
import type { ConfigInput } from './config';
import type { AuthorizationHeader } from './header';
import { HeaderName, stringifyAuthorizationHeader } from './header';
import { createDriver } from './utils';

export class Client {
    readonly '@instanceof' = Symbol.for('BaseClient');

    public driver!: Driver;

    // ---------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        this.setConfig(input);
    }

    // ---------------------------------------------------------------------------------

    public setConfig(input?: ConfigInput) {
        const config = buildConfig(input);

        let driver: Driver;
        if (config.driver || !this.driver) {
            driver = createDriver(config.driver);
        } else {
            driver = this.driver;
        }

        if (config.retry) {
            let retryConfig : DriverRetryConfig = {};

            if (typeof config.retry !== 'boolean') {
                retryConfig = config.retry;
            }

            const retrySymbol = Symbol.for('ClientRetry');
            if (!(retrySymbol in driver)) {
                (driver as any)[retrySymbol] = true;
                axiosRetry(driver, retryConfig);
            }
        }

        this.driver = driver;
    }

    /**
     * Return base url
     *
     * @param config
     *
     * @return string
     */
    public getBaseURL(config?: DriverRequestConfig): string {
        if (this.driver.defaults.baseURL) {
            return this.driver.defaults.baseURL;
        }

        return this.driver.getUri(config);
    }

    /**
     * Overwrite existing base url.
     *
     * @param url
     */
    public setBaseURL(url: string) {
        this.driver.defaults.baseURL = url;

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
        this.driver.defaults.headers.common[key] = value;

        return this;
    }

    /**
     * Get a header for all upcoming requests.
     *
     * @param key
     */
    public getHeader(key: string) {
        return this.driver.defaults.headers.common[key];
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
    public unsetHeaders() {
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
    public request<T = any, R = DriverResponse<T>, C = any>(config: DriverRequestConfig<C>): Promise<R> {
        return this.driver.request(config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Request a resource with the GET method.
     *
     * @param url
     * @param config
     */
    public get<T = any, R = DriverResponse<T>, C = any>(url: string, config?: DriverRequestConfig<C>): Promise<R> {
        return this.driver.get(url, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Delete a resource with the DELETE method.
     *
     * @param url
     * @param config
     */
    public delete<T = any, R = DriverResponse<T>, C = any>(url: string, config?: DriverRequestConfig<C>): Promise<R> {
        return this.driver.delete(url, config);
    }

    // ---------------------------------------------------------------------------------

    /**
     * Make a verification resource with the HEAD method.
     *
     * @param url
     * @param config
     */
    public head<T = any, R = DriverResponse<T>, C = any>(url: string, config?: DriverRequestConfig<C>): Promise<R> {
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
    public post<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
        return this.driver.post(url, data, config);
    }

    /**
     * Create a resource with the POST method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public postForm<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
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
    public put<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
        return this.driver.put(url, data, config);
    }

    /**
     * Update a resource with the PUT method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public putForm<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
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
    public patch<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
        return this.driver.patch(url, data, config);
    }

    /**
     * Update a resource with the PATCH method and FormData formatted payload.
     *
     * @param url
     * @param data
     * @param config
     */
    public patchForm<T = any, R = DriverResponse<T>, C = any>(url: string, data?: any, config?: DriverRequestConfig<C>): Promise<R> {
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
        onFulfilled: (value: DriverResponse<any>) => any | Promise<DriverResponse<any>>,
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

    /**
     * Unmount all response interceptors.
     */
    public unmountResponseInterceptors() {
        this.driver.interceptors.response.clear();
    }

    //---------------------------------------------------------------------------------

    /**
     * Mount a request interceptor.
     *
     * @param onFulfilled
     * @param onRejected
     */
    public mountRequestInterceptor(
        onFulfilled: (value: DriverRequestConfig) => any | Promise<DriverRequestConfig>,
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

    /**
     * Unmount all request interceptors.
     */
    public unmountRequestInterceptors() {
        this.driver.interceptors.request.clear();
    }
}
