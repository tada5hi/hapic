/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../fetch';
import { createProxy, fetch } from '../fetch';
import type { ITransport, TransportRequest } from './type';

export interface FetchTransportOptions {
    /**
     * Custom fetch implementation.
     *
     * Use this to supply a fetch bound to a specific engine / agent / dispatcher
     * (e.g. for mTLS, a custom CA bundle or keep-alive connection pooling).
     *
     * default: the cross-environment fetch resolved in `fetch.ts`.
     */
    fetch?: typeof fetch
}

/**
 * Production transport: dispatches via `fetch` and owns proxy resolution.
 *
 * This is the only module besides `fetch.ts` that touches `fetch`/`createProxy`.
 */
export class FetchTransport implements ITransport {
    readonly '@instanceof' = Symbol.for('ClientTransport');

    protected fetch : typeof fetch;

    constructor(options: FetchTransportOptions = {}) {
        this.fetch = options.fetch || fetch;
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        const { url, init, proxy } = request;

        if (proxy === false) {
            return this.fetch(url, init);
        }

        let proxyOptions : ProxyOptions | undefined;
        if (
            typeof proxy !== 'boolean' &&
            typeof proxy !== 'undefined'
        ) {
            proxyOptions = proxy;
        }

        return this.fetch(url, {
            ...init,
            ...createProxy(proxyOptions),
        });
    }
}
