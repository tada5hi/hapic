/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject, verifyInstanceBySymbol } from '../../utils';
import { ErrorCode } from '../constants';
import { ClientError } from '../module';

export function isClientError(
    error?: unknown,
): error is ClientError {
    if (error instanceof ClientError) {
        return true;
    }

    return isObject(error) &&
        verifyInstanceBySymbol(error, 'ClientError');
}

export function isClientErrorWithStatusCode(
    error: unknown,
    statusCode: number | number[],
): boolean {
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

export function isClientErrorDueNetworkIssue(
    error?: unknown,
) {
    return isClientError(error) &&
        !error.response &&
        Boolean(error.code) &&
        error.code !== ErrorCode.CONNECTION_ABORTED;
}
