/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../../utils';
import type { Response } from '../type';

export function isResponse(input: unknown) : input is Response {
    if (!isObject(input)) {
        return false;
    }

    return typeof (input as Response).headers !== 'undefined' &&
        typeof (input as Response).ok === 'boolean';
}
