/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode } from '../error';
import type { ClientError } from '../error';
import { verifyInstanceBySymbol } from './instance';

import { isObject } from './type-check';

export function isClientError(
    error?: unknown,
) : error is ClientError {
    return isObject(error) &&
        verifyInstanceBySymbol(error, 'ClientError');
}

export function hasClientFailedWithStausCode(
    error: unknown,
    statusCode: number | number[],
) : boolean {
    if (!isClientError(error) || !isObject(error.response)) {
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

export function hasClientFailedDueNetworkError(
    error?: unknown,
) {
    return isClientError(error) &&
        !error.response &&
        Boolean(error.code) &&
        error.code !== ErrorCode.CONNECTION_ABORTED;
}
