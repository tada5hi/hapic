/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client as BaseClient,
} from 'hapic';

export type {
    RequestConfig,
    Response,
    ClientInterface,
    Driver,
    DriverError,
    RetryConfig,

    ErrorCode,
} from 'hapic';
export {
    buildConfig,
    hasConfig,
    setConfig,
    unsetConfig,
    useConfig,

    isRequestError,
    isDriver,
    createDriver,
} from 'hapic';
export {
    BaseClient,
};
