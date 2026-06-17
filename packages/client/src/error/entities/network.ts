/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { markInstanceof } from '../../utils';
import { ClientError } from '../module';
import type { ClientErrorContext } from '../type';

export const NETWORK_ERROR_INSTANCE = Symbol.for('hapic/NetworkError');

/**
 * Raised when the request never produced a response — a dispatch failure,
 * aborted/closed connection, or other transport-level error.
 */
export class NetworkError<T = any> extends ClientError<T> {
    constructor(ctx: ClientErrorContext<T>) {
        super(ctx);

        markInstanceof(this, NETWORK_ERROR_INSTANCE);
    }
}
