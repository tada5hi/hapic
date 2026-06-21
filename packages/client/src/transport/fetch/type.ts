/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type FetchTransportFn = (input: string, init?: RequestInit) => Promise<Response>;

export type FetchTransportOptions = {
    /**
     * Custom fetch implementation.
     *
     * Use this to supply a fetch bound to a specific engine / agent / dispatcher
     * (e.g. for mTLS, a custom CA bundle or keep-alive connection pooling).
     *
     * default: the cross-environment fetch resolved in `fetch.ts`.
     */
    fetch?: FetchTransportFn
};

