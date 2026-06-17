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
} from '../utils';
import { isResponse } from '../response';
import type {
    ITransport,
    MemoryResponder,
    MemoryResponseInit,
    TransportRequest,
} from './type';

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
 * a `@hapic/*` client). Records every dispatched request and serves a FIFO queue
 * of canned responders, while the real request pipeline (header merge, decode,
 * hooks, retry) runs unchanged.
 */
export class MemoryTransport implements ITransport {
    readonly '@instanceof' = Symbol.for('ClientTransport');

    public readonly requests : TransportRequest[] = [];

    protected queue : MemoryResponder[] = [];

    /**
     * Append one or more responders to the queue. Each is consumed (FIFO) by a
     * single dispatch.
     */
    enqueue(...responders: MemoryResponder[]) : this {
        this.queue.push(...responders);

        return this;
    }

    /**
     * Queue a single canned response.
     */
    respondWith(response: MemoryResponseInit | Response) : this {
        return this.enqueue(response);
    }

    /**
     * Queue a rejection to drive the request-error path.
     */
    failNext(error?: Error) : this {
        return this.enqueue(error || new Error('Network request failed.'));
    }

    /**
     * The most recently recorded request.
     */
    get lastRequest() : TransportRequest | undefined {
        return this.requests[this.requests.length - 1];
    }

    /**
     * Reset the recorded requests and the responder queue.
     */
    reset() : this {
        this.requests.length = 0;
        this.queue.length = 0;

        return this;
    }

    async dispatch(request: TransportRequest) : Promise<Response> {
        this.requests.push(request);

        let responder = this.queue.shift();
        if (typeof responder === 'undefined') {
            responder = { status: 200 };
        }

        if (typeof responder === 'function') {
            responder = await responder(request);
        }

        if (responder instanceof Error) {
            throw responder;
        }

        return this.toResponse(responder);
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
