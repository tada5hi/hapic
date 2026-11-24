/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../../request';
import { HttpResponseError, NetworkError } from '../entities';
import { ClientError } from '../module';
import type { ClientErrorCloneOptions, ClientErrorContext } from '../types';

type ClientErrorCtor = new (ctx: ClientErrorContext) => ClientError;

const KNOWN_CTORS : ClientErrorCtor[] = [ClientError, HttpResponseError, NetworkError];

/**
 * A custom subclass (e.g. thrown by an error hook) is reduced to the
 * built-in class it stands for: its constructor may not take the context.
 */
function resolveCtor(error: ClientError) : ClientErrorCtor {
    const ctor = error.constructor as ClientErrorCtor;

    if (KNOWN_CTORS.includes(ctor)) {
        return ctor;
    }

    return error.response ? HttpResponseError : NetworkError;
}

/**
 * Create a fresh instance of the error's built-in class (so the @instanceof
 * marker chain and every guard still match) with the given request and/or
 * cause. Message, code, stack and response are kept.
 */
export function cloneClientError<T = any>(
    error: ClientError<T>,
    options: ClientErrorCloneOptions = {},
) : ClientError<T> {
    const request = 'request' in options ? options.request : error.request;
    const cause = 'cause' in options ? options.cause : error.cause;

    const Ctor = resolveCtor(error);
    const output = new Ctor({
        message: error.message,
        code: error.code as ClientErrorContext['code'],
        request: request as RequestOptions,
        response: error.response,
        ...(cause !== undefined ? { error: cause as Error } : {}),
    }) as ClientError<T>;

    if (error.stack) {
        output.stack = error.stack;
    }

    return output;
}

/**
 * Clone the error without the request headers and body (only method and
 * url are kept) and without the cause, so logging or serializing it does
 * not expose credentials or a request body.
 */
export function stripClientError<T = any>(error: ClientError<T>) : ClientError<T> {
    return cloneClientError(error, {
        request: { method: error.request?.method, url: error.request?.url } as RequestOptions,
        cause: undefined,
    });
}
