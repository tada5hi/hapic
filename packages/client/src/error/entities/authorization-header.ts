/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorInput, ErrorOptions } from '@ebec/core';
import { hasInstanceof, markInstanceof } from '../../utils';
import { ErrorCode } from '../constants';
import { HapicError } from '../hapic-error';

export const AUTHORIZATION_HEADER_ERROR_INSTANCE = Symbol.for('hapic/AuthorizationHeaderError');

export class AuthorizationHeaderError extends HapicError {
    constructor(input: ErrorInput = {}) {
        const options: ErrorOptions = typeof input === 'string' ? { message: input } : input;

        super({
            code: ErrorCode.AUTHORIZATION_HEADER_INVALID,
            message: 'The authorization header is not valid.',
            ...options,
        });

        markInstanceof(this, AUTHORIZATION_HEADER_ERROR_INSTANCE);
    }

    /* istanbul ignore next */
    static parse() {
        throw new AuthorizationHeaderError({
            code: ErrorCode.AUTHORIZATION_HEADER_PARSE,
            message: 'The authorization header value could not be parsed.',
        });
    }

    /* istanbul ignore next */
    static parseType() {
        throw new AuthorizationHeaderError({
            code: ErrorCode.AUTHORIZATION_HEADER_TYPE_PARSE,
            message: 'The authorization header value type must either be \'Bearer\' or \'Basic\'',
        });
    }
}

export function isAuthorizationHeaderError(
    input: unknown,
): input is AuthorizationHeaderError {
    return hasInstanceof(input, AUTHORIZATION_HEADER_ERROR_INSTANCE);
}
