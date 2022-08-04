/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';

import {
    IAxiosRetryConfig,
} from 'axios-retry';

export interface ClientRequestConfig<T = any> extends AxiosRequestConfig<T> {

}

export interface ClientResponse<T = any> extends AxiosResponse {

}

export interface ClientDriverInstance extends AxiosInstance {

}

export interface ClientError extends AxiosError {

}

export interface ClientRetryConfig extends IAxiosRetryConfig {

}
