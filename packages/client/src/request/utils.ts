/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../utils';
import type { RequestOptions } from './type';

export function isRequestOptions(input: unknown) : input is RequestOptions {
    if (!isObject(input)) {
        return false;
    }

    return input.url === 'string';
}
