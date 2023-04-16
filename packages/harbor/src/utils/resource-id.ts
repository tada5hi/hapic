/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Response } from 'hapic';
import { HeaderName } from '../constants';

export function extractResourceIDOfResponse(response: Pick<Response, 'headers'>) {
    if (
        response &&
        response.headers &&
        response.headers.has(HeaderName.LOCATION)
    ) {
        const value = response.headers.get(HeaderName.LOCATION);
        if (value) {
            const id = parseInt(value.substring(value.lastIndexOf('/') + 1), 10);
            if (!Number.isNaN(id)) {
                return id;
            }
        }
    }

    return undefined;
}
