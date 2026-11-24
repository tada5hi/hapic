/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// node-fetch-native is used as a fallback when no global Response is available.
import { Response as NodeResponse } from 'node-fetch-native';
import { Headers } from '../../fetch';
import { isResponse } from '../../response';
import {
    isArrayBuffer,
    isBlob,
    isFile,
    isFormData,
    isObject,
    isStream,
    isURLSearchParams,
    markInstanceof,
} from '../../utils';
import { globalContext } from '../../utils/global-this.ts';
import type { ITransport, TransportRequest } from '../types';
import { CLIENT_TRANSPORT_INSTANCE } from '../utils';
import type {
    MemoryResponseInit,
    MemoryTransportFetch,
    MemoryTransportOptions,
} from './types';

const ResponseCtor : typeof NodeResponse = (globalContext.Response as typeof NodeResponse | undefined) ||
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
        !isStream(body) &&
        !isWebStream(body);
}

function isWebStream(body: unknown) : boolean {
    return typeof ReadableStream !== 'undefined' &&
        body instanceof ReadableStream;
}

/**
 * Tie the response body to the signal: a read errors with the signal's reason
 * once it aborts, as a `fetch` body does. Status, status text and headers are
 * kept. The abort listener is removed once the body is done, errored or
 * cancelled.
 */
function bindResponseSignal(response: Response, signal: AbortSignal) : Response {
    if (!response.body || response.bodyUsed) {
        return response;
    }

    const reader = response.body.getReader();
    let settled = false;
    let onAbort : () => void = () => {};

    const settle = () => {
        settled = true;
        signal.removeEventListener('abort', onAbort);
    };

    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            onAbort = () => {
                if (settled) {
                    return;
                }

                settle();
                controller.error(signal.reason);
                reader.cancel(signal.reason).catch(() => {});
            };

            signal.addEventListener('abort', onAbort, { once: true });
        },
        async pull(controller) {
            try {
                const { done, value } = await reader.read();

                if (settled) {
                    return;
                }

                if (done) {
                    settle();
                    controller.close();

                    return;
                }

                controller.enqueue(value);
            } catch (e) {
                if (settled) {
                    return;
                }

                settle();
                controller.error(e);
            }
        },
        cancel(reason) {
            settle();

            return reader.cancel(reason);
        },
    });

    return new ResponseCtor(body as any, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    }) as unknown as Response;
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

    /**
     * Answer the request with the `fetch` handler. Like `fetch`, it honors
     * `request.signal`: an aborted signal rejects with its reason (also while
     * the handler is pending), and the returned body errors with that reason
     * once the signal aborts.
     */
    async dispatch(request: TransportRequest) : Promise<Response> {
        this.requests.push(request);

        const { signal } = request;

        if (!signal) {
            return this.toResponse(await this.handle(request));
        }

        signal.throwIfAborted();

        let onAbort : () => void = () => {};
        const aborted = new Promise<never>((_resolve, reject) => {
            onAbort = () => reject(signal.reason);
            signal.addEventListener('abort', onAbort, { once: true });
        });

        try {
            const result = await Promise.race([this.handle(request), aborted]);

            // the handler may have won the race although the signal aborted
            // meanwhile (e.g. synchronously inside the handler).
            signal.throwIfAborted();

            return bindResponseSignal(this.toResponse(result), signal);
        } finally {
            signal.removeEventListener('abort', onAbort);
        }
    }

    protected async handle(request: TransportRequest) : Promise<Response | MemoryResponseInit> {
        if (!this.fetch) {
            return { status: 200 };
        }

        return this.fetch(request);
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
