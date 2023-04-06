/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios from 'axios';
import type { DriverError } from '../type';
import { isObject } from './object';

export function isRequestError(error?: unknown) : error is DriverError {
    if (!isObject(error)) {
        return false;
    }

    if (
        Object.prototype.hasOwnProperty.call(error, 'config') &&
        Object.prototype.hasOwnProperty.call(error, 'isAxiosError') &&
        typeof error.isAxiosError === 'boolean'
    ) {
        return error.isAxiosError;
    }

    return axios.isAxiosError(error);
}

export function isNetworkError(error?: unknown) {
    return isObject(error) &&
        !error.response &&
        Boolean(error.code) &&
        error.code !== 'ECONNABORTED';
}
