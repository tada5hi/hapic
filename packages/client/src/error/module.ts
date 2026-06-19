/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../request';
import type { Response } from '../response';
import { markInstanceof } from '../utils';
import { HapicError } from './hapic-error';
import type { ClientErrorContext } from './type';

export const CLIENT_ERROR_INSTANCE = Symbol.for('hapic/ClientError');

/**
 * Umbrella error for everything the client throws.
 *
 * Subclasses ({@link NetworkError}, {@link HttpResponseError}) narrow the
 * failure mode. Each class registers its own `@instanceof` marker, so a single
 * instance answers `true` for every ancestor guard — e.g. an `HttpResponseError`
 * is also recognised by `isClientError`.
 */
export class ClientError<T = any> extends HapicError {
    readonly request: RequestOptions;

    readonly response?: Response<T>;

    readonly status?: number;

    readonly statusCode?: number;

    readonly statusMessage?: string;

    readonly statusText?: string;

    constructor(ctx: ClientErrorContext<T>) {
        super({
            message: ctx.message,
            code: ctx.code,
            cause: ctx.error,
        });

        this.request = ctx.request;
        this.response = ctx.response;

        this.status = ctx.response && ctx.response.status;
        this.statusCode = ctx.response && ctx.response.status;
        this.statusMessage = ctx.response && ctx.response.statusText;
        this.statusText = ctx.response && ctx.response.statusText;

        markInstanceof(this, CLIENT_ERROR_INSTANCE);
    }
}
