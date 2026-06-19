/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorInput } from 'hapic';
import { HapicError, hasInstanceof, markInstanceof } from 'hapic';

export const CONNECTION_STRING_PARSE_ERROR_INSTANCE = Symbol.for('@hapic/harbor/ConnectionStringParseError');

export class ConnectionStringParseError extends HapicError {
    constructor(input: ErrorInput = {}) {
        super(input);

        markInstanceof(this, CONNECTION_STRING_PARSE_ERROR_INSTANCE);
    }

    static connectionStringMissing(serviceName?: string) {
        const parts : string[] = ['The'];
        if (typeof serviceName === 'string') {
            parts.push(serviceName);
        }
        parts.push('connection string is not specified.');
        return new this(parts.join(' '));
    }

    static connectionStringInvalid(serviceName?: string) {
        const parts : string[] = ['The'];
        if (typeof serviceName === 'string') {
            parts.push(serviceName);
        }
        parts.push('connection string is not valid.');
        return new this(parts.join(' '));
    }
}

export function isConnectionStringParseError(
    input: unknown,
): input is ConnectionStringParseError {
    return hasInstanceof(input, CONNECTION_STRING_PARSE_ERROR_INSTANCE);
}
