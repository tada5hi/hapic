/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestErrorOptions, RequestOptions } from '../../request';
import { HttpResponseError, NetworkError } from '../entities';
import { ClientError } from '../module';
import type { ClientErrorContext } from '../types';

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
 * Reduce a client error to what the errors option keeps: a fresh instance
 * of the same class (so the @instanceof marker chain and every guard still
 * match), without the request headers and body (only method and url are
 * kept) and/or the cause. Message, stack and response stay.
 *
 * Returns the input itself when the options keep everything.
 */
export function redactClientError<T = any>(
    error: ClientError<T>,
    options: RequestErrorOptions = {},
) : ClientError<T> {
    const keepRequest = options.request !== false;
    const keepCause = options.cause !== false;

    if (keepRequest && keepCause) {
        return error;
    }

    const request = keepRequest ?
        error.request :
        { method: error.request?.method, url: error.request?.url } as RequestOptions;

    const Ctor = resolveCtor(error);
    const output = new Ctor({
        message: error.message,
        code: error.code as ClientErrorContext['code'],
        request,
        response: error.response,
        ...(keepCause && error.cause !== undefined ? { error: error.cause as Error } : {}),
    }) as ClientError<T>;

    if (error.stack) {
        output.stack = error.stack;
    }

    return output;
}
