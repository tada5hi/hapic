/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../fetch';
import { createProxy, fetch } from '../fetch';
import { markInstanceof } from '../utils';
import type { FetchTransportOptions, ITransport, TransportRequest } from './type';
import { CLIENT_TRANSPORT_INSTANCE } from './utils';

/**
 * Production transport: dispatches via `fetch` and owns proxy resolution.
 *
 * This is the only module besides `fetch.ts` that touches `fetch`/`createProxy`.
 */
export class FetchTransport implements ITransport {
    protected fetch : typeof fetch;

    constructor(options: FetchTransportOptions = {}) {
        this.fetch = options.fetch || fetch;

        markInstanceof(this, CLIENT_TRANSPORT_INSTANCE);
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        const { url, proxy, ...init } = request;

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
