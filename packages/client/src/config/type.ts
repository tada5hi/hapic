/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { IAxiosRetryConfig } from 'axios-retry';
import { ClientRequestConfig } from '../type';

export interface ClientInterface extends Function {
    new (config?: Config);
}

export type Config = {
    clazz?: ClientInterface,
    driver?: ClientRequestConfig,
    retry?: IAxiosRetryConfig | boolean,
    extra?: {
        connectionString?: string,
        [key: string]: any
    }
};
