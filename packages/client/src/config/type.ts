/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAxiosRetryConfig } from 'axios-retry';
import type { ClientRequestConfig } from '../type';

export interface ClientInterface extends Function {
    new (config?: ConfigInput) : any;
}

export type Config = {
    driver?: ClientRequestConfig,
    retry: IAxiosRetryConfig | boolean,
    extra: {
        connectionString?: string,
        [key: string]: any
    }
};

export type ConfigInput = Partial<Config>;
