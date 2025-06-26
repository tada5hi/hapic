/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseError } from 'ebec';
import type { RequestOptions } from '../request';
import type { Response } from '../response';
import type { ClientErrorContext } from './type';

export class ClientError<T = any> extends BaseError {
    readonly '@instanceof' = Symbol.for('ClientError');

    readonly request: RequestOptions;

    readonly response?: Response<T>;

    readonly status?: number;

    readonly statusCode?: number;

    readonly statusMessage?: string;

    readonly statusText?: string;

    constructor(ctx: ClientErrorContext<T>) {
        super({ cause: ctx.error });

        this.request = ctx.request;
        this.response = ctx.response;

        this.code = ctx.code;
        this.status = ctx.response && ctx.response.status;
        this.statusCode = ctx.response && ctx.response.status;
        this.statusMessage = ctx.response && ctx.response.statusText;
        this.statusText = ctx.response && ctx.response.statusText;

        this.message = ctx.message;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ClientError);
        }
    }
}
