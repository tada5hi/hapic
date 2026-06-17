/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions, fetch } from '../fetch';

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

export type FetchTransportOptions = {
    /**
     * Custom fetch implementation.
     *
     * Use this to supply a fetch bound to a specific engine / agent / dispatcher
     * (e.g. for mTLS, a custom CA bundle or keep-alive connection pooling).
     *
     * default: the cross-environment fetch resolved in `fetch.ts`.
     */
    fetch?: typeof fetch
};

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

export type MemoryResponseValue = Response | MemoryResponseInit | Error;
export type MemoryResponder =
    MemoryResponseValue |
    ((request: TransportRequest) => MemoryResponseValue | Promise<MemoryResponseValue>);
