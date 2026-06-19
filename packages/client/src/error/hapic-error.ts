/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ErrorInput } from '@ebec/core';
import { BaseError } from '@ebec/core';
import { markInstanceof } from '../utils';

export const HAPIC_ERROR_INSTANCE = Symbol.for('hapic/HapicError');

/**
 * Common root for every error a hapic package throws.
 *
 * It registers the shared `hapic/HapicError` marker, so — thanks to the
 * `@instanceof` marker chain — any descendant (a request `ClientError`, an
 * `AuthorizationHeaderError`, a service `ConnectionStringParseError`, …) is
 * recognised by `isHapicError`, regardless of which `@hapic/*` package threw it.
 *
 * Use `isHapicError` to answer "did this come from hapic?"; reach for the
 * narrower guards (`isClientError`, …) to branch on a specific failure mode.
 */
export class HapicError extends BaseError {
    constructor(input: ErrorInput = {}) {
        super(input);

        markInstanceof(this, HAPIC_ERROR_INSTANCE);
    }
}
