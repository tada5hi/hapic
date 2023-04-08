/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';

export type {
    DriverRequestConfig,
    DriverResponse,
    ClientInterface,
    Driver,
    DriverError,
    DriverRetryConfig,

    ErrorCode,
} from 'hapic';

export {
    isRequestError,
    isRequestErrorWithStatusCode,
    isNetworkError,
    isDriver,
    createDriver,
} from 'hapic';
export {
    BaseClient,
};
