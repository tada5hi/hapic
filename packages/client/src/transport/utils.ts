/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject, verifyInstanceBySymbol } from '../utils';
import type { ITransport } from './type';

export function isTransport(input: unknown) : input is ITransport {
    if (verifyInstanceBySymbol(input, 'ClientTransport')) {
        return true;
    }

    return isObject(input) &&
        typeof (input as ITransport).dispatch === 'function';
}
