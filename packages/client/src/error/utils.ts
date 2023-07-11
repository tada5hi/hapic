/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../request';
import { isObject, verifyInstanceBySymbol } from '../utils';
import { ErrorCode } from './constants';
import { ClientError } from './module';
import type { ClientErrorCreateContext } from './type';

function formatRequestOptions(input: RequestOptions) : string {
    if (input.url) {
        let output = input.url;
        if (input.query) {
            const searchParams = new URLSearchParams(input.query);
            const searchQuery = searchParams.toString();
            if (searchQuery.length > 0) {
                output += `?${searchQuery}`;
            }
        }

        return output;
    }

    return input.toString();
}

export function createClientError<T = any >(
    context: ClientErrorCreateContext<T>,
) {
    let message : string | undefined;

    if (context.request && context.response) {
        message = `${context.response.status} ${
            context.response.statusText
        } (${formatRequestOptions(context.request)})`;
    } else if (context.request) {
        message = `${formatRequestOptions(context.request)}`;
    }

    if (
        context.error &&
        context.error.message
    ) {
        message = `${context.error.message} (${message})`;
    }

    if (!message) {
        message = 'An unknown error occurred.';
    }

    const isAbort = (!!context.error && context.error.name === 'AbortError');

    let code : ErrorCode | undefined;
    if (!context.response) {
        if (isAbort) {
            code = ErrorCode.CONNECTION_ABORTED;
        } else {
            code = ErrorCode.CONNECTION_CLOSED;
        }
    }

    const output: ClientError<T> = new ClientError({
        ...context,
        code,
        message,
    });

    return output;
}

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
