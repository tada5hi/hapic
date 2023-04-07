/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DriverResponse } from 'hapic';
import { HeaderName } from '../constants';

export function extractResourceIDOfResponse(response: Pick<DriverResponse, 'headers'>) {
    if (
        response &&
        response.headers &&
        typeof response.headers[HeaderName.LOCATION] === 'string'
    ) {
        const value = response.headers[HeaderName.LOCATION];
        const id = parseInt(value.substring(value.lastIndexOf('/') + 1), 10);
        if (!Number.isNaN(id)) {
            return id;
        }
    }

    return undefined;
}
