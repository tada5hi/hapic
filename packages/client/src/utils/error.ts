/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios from 'axios';
import type { DriverError } from '../type';
import { isObject } from './object';

export function isDriverError(
    error?: unknown,
) : error is DriverError {
    return isObject(error) && axios.isAxiosError(error);
}

export function hasDriverFailedWithStausCode(
    error: unknown,
    statusCode: number | number[],
) : boolean {
    if (!isDriverError(error) || !isObject(error.response)) {
        return false;
    }

    const statusCodes = Array.isArray(statusCode) ?
        statusCode :
        [statusCode];

    for (let i = 0; i < statusCodes.length; i++) {
        if (statusCodes[i] === error.response.status) {
            return true;
        }
    }

    return false;
}

export function hasDriverFailedDueNetworkError(
    error?: unknown,
) {
    return isDriverError(error) &&
        !error.response &&
        Boolean(error.code) &&
        error.code !== 'ECONNABORTED';
}
