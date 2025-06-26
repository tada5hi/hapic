/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../../request';
import { ErrorCode } from '../constants';
import { ClientError } from '../module';
import type { ClientErrorCreateContext } from '../type';

function formatRequestOptions(input: RequestOptions): string {
    if (input.url) {
        const parts: string[] = [];
        if (input.method) {
            parts.push(input.method);
        }

        parts.push(input.url);

        return parts.join(' ');
    }

    return input.toString();
}

export function createClientError<T = any>(
    context: ClientErrorCreateContext<T>,
) {
    let message: string | undefined;

    if (context.request && context.response) {
        message = `${context.response.status} ${
            context.response.statusText
        } (${formatRequestOptions(context.request)})`;
    } else if (context.request) {
        message = `${formatRequestOptions(context.request)}`;
    }

    if (context.error) {
        if (context.error.message) {
            message = `${context.error.message} (${message})`;
        }
    }

    if (!message) {
        message = 'An unknown error occurred.';
    }

    const isAbort = (!!context.error && context.error.name === 'AbortError');

    let code: ErrorCode | undefined;
    if (!context.response) {
        if (isAbort) {
            code = ErrorCode.CONNECTION_ABORTED;
        } else {
            code = ErrorCode.CONNECTION_CLOSED;
        }
    }

    const error = new ClientError<T>({
        ...context,
        code,
        message,
    });

    if (Error.captureStackTrace) {
        Error.captureStackTrace(error, createClientError);
    }

    return error;
}
