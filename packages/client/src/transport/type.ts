/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../fetch';

/**
 * A fully-resolved, ready-to-dispatch request handed to the transport.
 *
 * The url is already base-/query-resolved, and init already carries the merged
 * headers, the transformed body and the method. proxy is passed through so the
 * adapter (not the request pipeline) owns proxy resolution.
 */
export interface TransportRequest {
    url: string,
    init: RequestInit,
    proxy?: ProxyOptions | boolean
}

/**
 * The single I/O boundary of the client.
 *
 * - MUST resolve with a raw `globalThis.Response`, body left UNREAD (the
 *   pipeline decodes it).
 * - MUST reject on a network/dispatch failure.
 * - MUST NOT throw for a 4xx/5xx status (status interpretation belongs to the
 *   pipeline).
 */
export interface ITransport {
    dispatch(request: TransportRequest) : Promise<Response>
}
