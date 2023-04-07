/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DriverResponse } from 'hapic';
import { HeaderName } from '../constants';

type Meta = {
    total?: number
};
export function extractResourceMetaOfResponse(response: DriverResponse) : Meta {
    const meta : Meta = {};

    if (
        response.headers &&
        typeof response.headers[HeaderName.TOTAL_COUNT] === 'number'
    ) {
        meta.total = response.headers[HeaderName.TOTAL_COUNT];
    }

    return meta;
}
