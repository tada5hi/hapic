/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientError, isObject } from '../../utils';
import type { ClientContextWithError } from './type';

export function isClientContextWithError(
    input: unknown,
) : input is ClientContextWithError {
    return isObject(input) &&
        isClientError(input.error);
}
