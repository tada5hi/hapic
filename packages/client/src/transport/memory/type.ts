/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportRequest } from '../type';

export type MemoryResponseInit = {
    status?: number,
    statusText?: string,
    headers?: Record<string, string> | [string, string][],
    /**
     * Plain objects/arrays are JSON-serialized (and tagged with a JSON
     * content-type when none is set). Everything else is passed through as-is.
     */
    body?: any
};

export type MemoryTransportFetch = (request: TransportRequest) =>
Response | MemoryResponseInit | Promise<Response | MemoryResponseInit>;

export type MemoryTransportOptions = {
    /**
     * Handle every dispatched request. Return a `Response` to use as-is, or a
     * `MemoryResponseInit` ({ status, statusText, headers, body }) that is turned
     * into a `Response` via the same rules as the production transport. Throw (or
     * reject) to drive the request-error path.
     *
     * default: an empty 200 response.
     */
    fetch?: MemoryTransportFetch
};
