/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Response } from 'hapic';
import { HeaderName } from '../constants';

type Meta = {
    total?: number
};
export function extractResourceMetaOfResponse(response: Response) : Meta {
    const meta : Meta = {};

    if (
        response.headers &&
        response.headers.has(HeaderName.TOTAL_COUNT)
    ) {
        const total = parseInt(response.headers.get(HeaderName.TOTAL_COUNT) || '0', 10);
        if (!Number.isNaN(total)) {
            meta.total = total;
        }
    }

    return meta;
}
