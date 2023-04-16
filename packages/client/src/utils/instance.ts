/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from './type-check';

export function verifyInstanceBySymbol(
    input: unknown,
    name: string,
) {
    if (!isObject(input) && typeof input !== 'function') {
        return false;
    }

    return (input as { '@instanceof': symbol })['@instanceof'] ===
        Symbol.for(name);
}
