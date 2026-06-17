/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// node-fetch-native is used as a fallback when no global Response is available.
import { Response as NodeResponse } from 'node-fetch-native';
import { Headers } from '../fetch';
import {
    isArrayBuffer,
    isBlob,
    isFile,
    isFormData,
    isObject,
    isStream,
    isURLSearchParams,
    markInstanceof,
} from '../utils';
import { isResponse } from '../response';
import type {
    ITransport,
    MemoryResponseInit,
    MemoryTransportFetch,
    MemoryTransportOptions,
    TransportRequest,
} from './type';
import { CLIENT_TRANSPORT_INSTANCE } from './utils';

const ResponseCtor : typeof NodeResponse = (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { Response?: unknown }).Response !== 'undefined'
) ?
    (globalThis as unknown as { Response: typeof NodeResponse }).Response :
    NodeResponse;

function shouldSerializeBody(body: unknown) : boolean {
    if (!isObject(body) && !Array.isArray(body)) {
        return false;
    }

    // typed arrays / DataView / Node Buffer are valid binary bodies, not JSON.
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(body)) {
        return false;
    }

    return !isBlob(body) &&
        !isFile(body) &&
        !isArrayBuffer(body) &&
        !isFormData(body) &&
        !isURLSearchParams(body) &&
        !isStream(body);
}

/**
 * In-memory transport for tests (and for testing downstream code that builds on
 * a `@hapic/*` client). Records every dispatched request and answers it with the
 * `fetch` handler, while the real request pipeline (header merge, decode, hooks,
 * retry) runs unchanged.
 */
export class MemoryTransport implements ITransport {
    public readonly requests : TransportRequest[] = [];

    protected fetch : MemoryTransportFetch | undefined;

    constructor(options: MemoryTransportOptions = {}) {
        this.fetch = options.fetch;

        markInstanceof(this, CLIENT_TRANSPORT_INSTANCE);
    }

    /**
     * Clear the recorded requests. The `fetch` handler is left in place.
     */
    reset() : this {
        this.requests.length = 0;

        return this;
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        this.requests.push(request);

        const result = this.fetch ?
            await this.fetch(request) :
            { status: 200 };

        return this.toResponse(result);
    }

    protected toResponse(input: Response | MemoryResponseInit) : Response {
        if (isResponse(input)) {
            return input as Response;
        }

        const headers = new Headers(input.headers);
        let { body } = input;

        if (shouldSerializeBody(body)) {
            if (!headers.has('content-type')) {
                headers.set('content-type', 'application/json');
            }

            body = JSON.stringify(body);
        }

        return new ResponseCtor(body, {
            status: input.status ?? 200,
            statusText: input.statusText,
            headers,
        }) as unknown as Response;
    }
}
