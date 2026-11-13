/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Response } from 'hapic';
import { HeaderName } from '../constants';

function extractLastLocationSegment(response: Pick<Response, 'headers'>) : string | undefined {
    if (
        response &&
        response.headers &&
        response.headers.has(HeaderName.LOCATION)
    ) {
        const value = response.headers.get(HeaderName.LOCATION);

        if (value) {
            return value.substring(value.lastIndexOf('/') + 1);
        }
    }

    return undefined;
}

export function extractResourceIDOfResponse(response: Pick<Response, 'headers'>) {
    const segment = extractLastLocationSegment(response);

    if (segment) {
        const id = Number.parseInt(segment, 10);

        if (!Number.isNaN(id)) {
            return id;
        }
    }

    return undefined;
}

/**
 * Extract the resource name from the `Location` header
 * of a create response sent with `X-Resource-Name-In-Location: true`.
 */
export function extractResourceNameOfResponse(response: Pick<Response, 'headers'>) : string | undefined {
    return extractLastLocationSegment(response) || undefined;
}
