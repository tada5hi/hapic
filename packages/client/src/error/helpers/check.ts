/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasInstanceof, isObject } from '../../utils';
import { ErrorCode } from '../constants';
import {
    HTTP_RESPONSE_ERROR_INSTANCE,
    type HttpResponseError,
    NETWORK_ERROR_INSTANCE,
    type NetworkError,
} from '../entities';
import { HAPIC_ERROR_INSTANCE, type HapicError } from '../hapic-error';
import { CLIENT_ERROR_INSTANCE, type ClientError } from '../module';

export function isHapicError(
    error?: unknown,
): error is HapicError {
    return hasInstanceof(error, HAPIC_ERROR_INSTANCE);
}

export function isClientError(
    error?: unknown,
): error is ClientError {
    return hasInstanceof(error, CLIENT_ERROR_INSTANCE);
}

export function isNetworkError(
    error?: unknown,
): error is NetworkError {
    return hasInstanceof(error, NETWORK_ERROR_INSTANCE);
}

export function isHttpResponseError(
    error?: unknown,
): error is HttpResponseError {
    return hasInstanceof(error, HTTP_RESPONSE_ERROR_INSTANCE);
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

    for (const statusCode_ of statusCodes) {
        if (statusCode_ === error.response.status) {
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
