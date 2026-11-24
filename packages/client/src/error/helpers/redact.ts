/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestErrorOptions, RequestOptions } from '../../request';
import type { Response } from '../../response';
import { HttpResponseError, NetworkError } from '../entities';
import { ClientError } from '../module';
import type { ClientErrorContext } from '../types';

type ClientErrorCtor = new (ctx: ClientErrorContext) => ClientError;

const KNOWN_CTORS : ClientErrorCtor[] = [ClientError, HttpResponseError, NetworkError];

function resolveCtor(error: ClientError) : ClientErrorCtor {
    const ctor = error.constructor as ClientErrorCtor;

    if (KNOWN_CTORS.includes(ctor)) {
        return ctor;
    }

    return error.response ? HttpResponseError : NetworkError;
}

/**
 * Hide the url of a fetch response, which carries the request's query.
 */
function redactResponse<T>(response: Response<T>) : Response<T> {
    if (typeof response.url !== 'string' || response.url.length === 0) {
        return response;
    }

    const descriptor = Object.getOwnPropertyDescriptor(response, 'url');

    if (!descriptor || descriptor.configurable) {
        Object.defineProperty(response, 'url', {
            configurable: true,
            enumerable: descriptor ? descriptor.enumerable : false,
            value: '',
        });
    }

    return response;
}

/**
 * Reduce a client error to what the errors option keeps: a fresh instance
 * of the same class (so the @instanceof marker chain and every guard still
 * match), without the request details (url, headers, body) and/or the cause.
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

    let { message } = error;
    let { request } = error;
    let { response } = error;

    if (!keepRequest) {
        request = { method: error.request?.method } as RequestOptions;

        if (response) {
            message = `${response.status} ${response.statusText || ''}`.trim();
            response = redactResponse(response);
        } else {
            message = error.code;
        }
    }

    const Ctor = resolveCtor(error);
    const output = new Ctor({
        message,
        code: error.code as ClientErrorContext['code'],
        request,
        response,
        ...(keepCause && error.cause !== undefined ? { error: error.cause as Error } : {}),
    }) as ClientError<T>;

    if (keepRequest && error.stack) {
        // only the cause is dropped: keep the original stack.
        output.stack = error.stack;
    }

    return output;
}
