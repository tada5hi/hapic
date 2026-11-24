/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { markInstanceof } from '../../utils';
import { FetchTransport } from '../fetch';
import { hasXMLHttpRequest, isXMLHttpRequestBody } from '../helpers';
import type { ITransport, TransportRequest } from '../types';
import { CLIENT_TRANSPORT_INSTANCE } from '../utils';
import { dispatchXMLHttpRequest } from './dispatch';
import type { XhrTransportOptions } from './types';

/**
 * Transport that sends every request by XMLHttpRequest, reporting upload
 * progress through the request's onUploadProgress listener.
 *
 * The response body is read in full before the promise resolves (no
 * streaming), and the proxy option does not apply. A request XMLHttpRequest
 * cannot send (none exists, or a stream body) goes to the fallback transport.
 */
export class XhrTransport implements ITransport {
    protected fallback : ITransport | undefined;

    constructor(options: XhrTransportOptions = {}) {
        this.fallback = options.fallback;

        markInstanceof(this, CLIENT_TRANSPORT_INSTANCE);
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        if (
            hasXMLHttpRequest() &&
            (request.body === null || typeof request.body === 'undefined' || isXMLHttpRequestBody(request.body))
        ) {
            return dispatchXMLHttpRequest(request);
        }

        if (!this.fallback) {
            this.fallback = new FetchTransport();
        }

        return this.fallback.dispatch(request);
    }
}
