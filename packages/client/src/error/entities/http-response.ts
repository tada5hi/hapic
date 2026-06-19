/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { markInstanceof } from '../../utils';
import { ClientError } from '../module';
import type { ClientErrorContext } from '../type';

export const HTTP_RESPONSE_ERROR_INSTANCE = Symbol.for('hapic/HttpResponseError');

/**
 * Raised when the server answered with a `4xx`/`5xx` status. Carries the
 * decoded {@link Response} and its `status`.
 */
export class HttpResponseError<T = any> extends ClientError<T> {
    constructor(ctx: ClientErrorContext<T>) {
        super(ctx);

        markInstanceof(this, HTTP_RESPONSE_ERROR_INSTANCE);
    }
}
