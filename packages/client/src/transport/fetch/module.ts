/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../../types';
import { Headers, createProxy, fetch } from '../../fetch';
import { isWebStream, markInstanceof } from '../../utils';
import { globalContext } from '../../utils/global-this.ts';
import { countUploadProgress, getBodySize, notifyUploadProgress } from '../helpers';
import type { ITransport, TransportRequest } from '../types';
import { CLIENT_TRANSPORT_INSTANCE } from '../utils';
import type { FetchTransportFn, FetchTransportOptions } from './types';

/**
 * Production transport: dispatches via `fetch` and owns proxy resolution.
 *
 * This is the only module besides `fetch.ts` that touches `fetch`/`createProxy`.
 */
export class FetchTransport implements ITransport {
    protected fetch : FetchTransportFn;

    constructor(options: FetchTransportOptions = {}) {
        // Bind the receiver to the global object. The WHATWG `fetch` is a branded
        // method of `Window`/`WorkerGlobalScope` and throws `Illegal invocation`
        // unless its receiver is the global object - calling it as `this.fetch(...)`
        // (receiver = the transport instance) breaks in browsers. Binding here also
        // makes a user-supplied `options.fetch` receiver-safe.
        if (options.fetch) {
            this.fetch = options.fetch.bind(globalContext);
        } else {
            this.fetch = fetch.bind(globalContext);
        }

        markInstanceof(this, CLIENT_TRANSPORT_INSTANCE);
    }

    /**
     * Send the request; with an upload progress listener, a stream body is
     * counted while fetch reads it, any other body reports one event once
     * it is sent (when its size is known).
     */
    async dispatch(request: TransportRequest) : Promise<Response> {
        const { onUploadProgress, ...input } = request;

        if (!onUploadProgress) {
            return this.send(input);
        }

        if (isWebStream(input.body)) {
            const length = Number.parseInt(new Headers(input.headers).get('content-length') || '', 10);

            return this.send({
                ...input,
                body: countUploadProgress(
                    input.body,
                    onUploadProgress,
                    Number.isNaN(length) ? undefined : length,
                ),
                duplex: 'half',
            } as TransportRequest);
        }

        const total = getBodySize(input.body);
        const response = await this.send(input);

        if (typeof total === 'number') {
            notifyUploadProgress(onUploadProgress, { loaded: total, total });
        }

        return response;
    }

    protected async send(request: TransportRequest) : Promise<Response> {
        const {
            url,
            proxy,
            ...init
        } = request;

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
