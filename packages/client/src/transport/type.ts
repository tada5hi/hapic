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
 * Mirrors `RequestBaseOptions` by flattening `RequestInit` in directly (rather
 * than nesting it): the merged headers, transformed body and method sit
 * alongside the already base-/query-resolved url. proxy is passed through so the
 * adapter (not the request pipeline) owns proxy resolution.
 */
export type TransportRequest = RequestInit & {
    url: string,
    proxy?: ProxyOptions | boolean
};

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
