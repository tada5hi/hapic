/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasInstanceof, isObject } from '../utils';
import type { ITransport } from './type';

export const CLIENT_TRANSPORT_INSTANCE = Symbol.for('hapic/ClientTransport');

export function isTransport(input: unknown) : input is ITransport {
    if (hasInstanceof(input, CLIENT_TRANSPORT_INSTANCE)) {
        return true;
    }

    return isObject(input) &&
        typeof (input as ITransport).dispatch === 'function';
}
