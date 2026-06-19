/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderStore } from './store';
import type { HeaderContainer } from './type';

export function setHeader(
    headers: HeaderContainer,
    key: string,
    value: any,
) {
    new HeaderStore(headers).set(key, value);
}

export function getHeader(
    headers: HeaderContainer,
    key: string,
) : string | undefined {
    return new HeaderStore(headers).get(key);
}

export function unsetHeader(
    headers: HeaderContainer,
    key: string,
) {
    new HeaderStore(headers).unset(key);
}
