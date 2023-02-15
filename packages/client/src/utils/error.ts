/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios from 'axios';
import type { ClientError } from '../type';

export function isClientError(error?: any) : error is ClientError {
    if (typeof error !== 'object') {
        return false;
    }

    if (
        Object.prototype.hasOwnProperty.call(error, 'config') &&
        Object.prototype.hasOwnProperty.call(error, 'isAxiosError') &&
        typeof error.isAxiosError === 'boolean'
    ) {
        return !!error.isAxiosError;
    }

    return axios.isAxiosError(error);
}
