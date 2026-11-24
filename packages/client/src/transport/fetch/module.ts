/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProxyOptions } from '../../types';
import { Headers, createProxy, fetch } from '../../fetch';
import { isBlob, isObject, markInstanceof } from '../../utils';
import { globalContext } from '../../utils/global-this.ts';
import {
    countUploadProgress,
    createResponse,
    getBodySize,
    hasXMLHttpRequest,
    isNodeRuntime,
    isXMLHttpRequestBody,
    notifyUploadProgress,
} from '../helpers';
import type { ITransport, TransportRequest, UploadProgressListener } from '../types';
import { CLIENT_TRANSPORT_INSTANCE } from '../utils';
import { dispatchXMLHttpRequest } from '../xhr/dispatch';
import type { FetchTransportFn, FetchTransportOptions, FetchUploadStrategy } from './types';

/**
 * Production transport: dispatches via `fetch` and owns proxy resolution.
 *
 * This is the only module besides `fetch.ts` that touches `fetch`/`createProxy`.
 */
export class FetchTransport implements ITransport {
    protected fetch : FetchTransportFn;

    protected hasCustomFetch : boolean;

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

        // A custom fetch is the user's pick: upload progress never bypasses it by XHR.
        this.hasCustomFetch = !!options.fetch;

        markInstanceof(this, CLIENT_TRANSPORT_INSTANCE);
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        const { onUploadProgress, ...input } = request;

        if (
            !onUploadProgress ||
            input.body === null ||
            typeof input.body === 'undefined'
        ) {
            return this.send(input);
        }

        switch (this.resolveUploadStrategy(request)) {
            case 'xhr':
                return dispatchXMLHttpRequest(request);
            case 'stream':
                return this.sendStream(input, onUploadProgress);
            default: {
                const total = getBodySize(input.body);
                const response = await this.send(input);

                if (typeof total === 'number') {
                    notifyUploadProgress(onUploadProgress, { loaded: total, total });
                }

                return response;
            }
        }
    }

    /**
     * Pick how a request with a body and an upload progress listener is sent:
     *
     * - xhr: XMLHttpRequest exists, the body is one it takes, no proxy options
     *   object is set (proxies are Node.js only), the response is not read as
     *   a stream (XHR buffers it) and no custom fetch was given.
     * - stream: Node.js; fetch sends the body as a byte-counting stream.
     * - fetch: plain fetch, one event once the body is sent (when its size is known).
     */
    protected resolveUploadStrategy(request: TransportRequest) : FetchUploadStrategy {
        if (
            hasXMLHttpRequest() &&
            !this.hasCustomFetch &&
            !isObject(request.proxy) &&
            request.responseType !== 'stream' &&
            isXMLHttpRequestBody(request.body)
        ) {
            return 'xhr';
        }

        if (isNodeRuntime()) {
            return 'stream';
        }

        return 'fetch';
    }

    /**
     * Send the body as a stream counting the bytes fetch reads from it.
     * A body of known size keeps its content-length (instead of chunked
     * encoding) and content-type (e.g. the multipart boundary of form data).
     */
    protected async sendStream(
        request: TransportRequest,
        listener: UploadProgressListener,
    ) : Promise<Response> {
        const headers = new Headers(request.headers);
        const { body } = request;

        let stream : ReadableStream<Uint8Array> | null;
        let total : number | undefined;
        let contentType : string | null = null;

        if (isBlob(body)) {
            stream = body.stream();
            total = body.size;
            contentType = body.type;
        } else if (isXMLHttpRequestBody(body)) {
            const normalized = createResponse(body);
            const blob = await normalized.blob();

            stream = blob.stream();
            total = blob.size;
            contentType = normalized.headers.get('content-type');
        } else {
            stream = createResponse(body).body;

            const length = Number.parseInt(headers.get('content-length') || '', 10);

            total = Number.isNaN(length) ? undefined : length;
        }

        if (contentType && !headers.has('content-type')) {
            headers.set('content-type', contentType);
        }

        if (typeof total === 'number') {
            headers.set('content-length', `${total}`);
        }

        return this.send({
            ...request,
            headers,
            body: stream ? countUploadProgress(stream, listener, total) : null,
            duplex: 'half',
        } as TransportRequest);
    }

    protected async send(request: TransportRequest) : Promise<Response> {
        const {
            url,
            proxy,
            responseType,
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
