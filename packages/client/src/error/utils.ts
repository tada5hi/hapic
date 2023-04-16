/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientError } from './module';
import type { ClientErrorCreateContext } from './type';

export function createClientError<T = any >(context: ClientErrorCreateContext<T>) {
    let message : string | undefined;

    if (context.request && context.response) {
        message = `${context.response.status} ${
            context.response.statusText
        } (${context.request.toString()})`;
    } else if (context.request) {
        message = `${context.request.toString()}`;
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

    const output: ClientError<T> = new ClientError({
        ...context,
        message,
    });

    return output;
}
