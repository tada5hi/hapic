/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorInput, ErrorOptions } from '@ebec/core';
import { hasInstanceof, markInstanceof } from '../../utils';
import { ErrorCode } from '../constants';
import { HapicError } from '../hapic-error';

export const CONNECTION_STRING_PARSE_ERROR_INSTANCE = Symbol.for('hapic/ConnectionStringParseError');

/**
 * Raised when a service connection string cannot be parsed into its
 * `<credentials>@<host>` parts (see {@link parseConnectionString}).
 *
 * It lives in the base package so the shared parser can throw it and every
 * `@hapic/*` service client recognises the same error type — the harbor and
 * vault packages re-export it rather than declaring their own copy.
 */
export class ConnectionStringParseError extends HapicError {
    constructor(input: ErrorInput = {}) {
        const options: ErrorOptions = typeof input === 'string' ? { message: input } : input;

        super({
            code: ErrorCode.CONNECTION_STRING_INVALID,
            message: 'The connection string is not valid.',
            ...options,
        });

        markInstanceof(this, CONNECTION_STRING_PARSE_ERROR_INSTANCE);
    }
}

export function isConnectionStringParseError(
    input: unknown,
): input is ConnectionStringParseError {
    return hasInstanceof(input, CONNECTION_STRING_PARSE_ERROR_INSTANCE);
}
