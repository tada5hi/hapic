/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AxiosHeaders } from 'axios';
import type {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestTransformer,
    AxiosResponse,
} from 'axios';

import type {
    IAxiosRetryConfig,
} from 'axios-retry';

export interface DriverRequestConfig<T = any> extends AxiosRequestConfig<T> {

}

export interface DriverRequestTransformer extends AxiosRequestTransformer {

}

export interface DriverResponse<T = any, D = any> extends AxiosResponse<T, D> {

}

export class DriverHeaders extends AxiosHeaders {

}

export interface DriverRetryConfig extends IAxiosRetryConfig {

}

export interface Driver extends AxiosInstance {

}

export interface DriverError<T = any, D = any> extends AxiosError<T, D> {

}
