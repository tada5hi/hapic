/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';

import type {
    IAxiosRetryConfig,
} from 'axios-retry';

export interface ClientRequestConfig<T = any> extends AxiosRequestConfig<T> {

}

export interface ClientResponse<T = any, D = any> extends AxiosResponse<T, D> {

}

export interface ClientDriverInstance extends AxiosInstance {

}

export interface ClientError<T = any, D = any> extends AxiosError<T, D> {

}

export interface ClientRetryConfig extends IAxiosRetryConfig {

}
