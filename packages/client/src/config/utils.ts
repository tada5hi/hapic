/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from './type';
import { hasOwnProperty } from '../utils';

export function isConfig(value: unknown) : value is ConfigInput {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    if (
        hasOwnProperty(value, 'driver') &&
        (
            typeof value.driver !== 'object' ||
                value.driver === null
        )
    ) {
        return false;
    }

    if (
        hasOwnProperty(value, 'retry') &&
        typeof value.retry !== 'boolean' &&
        (
            typeof value.retry !== 'object' ||
            value.retry === null
        )
    ) {
        return false;
    }

    return !(
        hasOwnProperty(value, 'extra') &&
        (
            typeof value.extra !== 'object' ||
            value.extra === null
        )
    );
}
