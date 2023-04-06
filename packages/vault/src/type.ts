/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Config as BaseConfig } from 'hapic';

export type ConnectionOptions = {
    host: string,
    token: string
};

export type ResourceResponse<T extends Record<string, any> = Record<string, any>> = {
    auth: null,
    data: T,
    lease_duration: number,
    lease_id: string,
    renewable: boolean,
    request_id: string,
    warnings: null,
    wrap_info: null
};

export type Config = BaseConfig & {
    connectionString?: string,
    connectionOptions?: ConnectionOptions
};

export type ConfigInput = Partial<Config>;
