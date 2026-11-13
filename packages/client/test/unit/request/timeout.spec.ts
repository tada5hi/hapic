/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportRequest } from '../../../src';
import {
    Client,
    ErrorCode,
    HookName,
    MemoryTransport,
    isClientError,
    isClientErrorDueNetworkIssue,
    isClientErrorDueTimeout,
    isNetworkError,
} from '../../../src';

function waitForAbort(request: TransportRequest) : Promise<never> {
    return new Promise((_resolve, reject) => {
        const { signal } = request;

        if (!signal) {
            return;
        }

        if (signal.aborted) {
            reject(signal.reason);

            return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
}

function createHangingTransport() {
    return new MemoryTransport({ fetch: (request) => waitForAbort(request) });
}

function createDelayedTransport(ms: number) {
    return new MemoryTransport({
        fetch: (request) => new Promise((resolve, reject) => {
            const timer = setTimeout(() => resolve({ status: 200, body: { ok: true } }), ms);

            waitForAbort(request).catch((e) => {
                clearTimeout(timer);
                reject(e);
            });
        }),
    });
}

async function catchError(promise: Promise<unknown>) : Promise<unknown> {
    try {
        await promise;
    } catch (e) {
        return e;
    }

    throw new Error('Expected the request to reject.');
}

describe('src/request/timeout', () => {
    it('should reject with a timeout error when the client timeout elapses', async () => {
        const client = new Client({
            baseURL: 'https://api.test/',
            transport: createHangingTransport(),
            timeout: 20,
        });

        const error = await catchError(client.get('slow'));

        expect(isNetworkError(error)).toBe(true);
        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
        expect(isClientErrorDueTimeout(error)).toBe(true);
        expect(isClientErrorDueNetworkIssue(error)).toBe(true);
    });

    it('should reject with a timeout error when a per-request timeout elapses', async () => {
        const client = new Client({ baseURL: 'https://api.test/', transport: createHangingTransport() });

        const error = await catchError(client.get('slow', { timeout: 20 }));

        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should let a per-request timeout override the client default', async () => {
        const client = new Client({
            baseURL: 'https://api.test/',
            transport: createDelayedTransport(30),
            timeout: 10,
        });

        const response = await client.get('slow', { timeout: 1000 });

        expect(response.data).toEqual({ ok: true });
    });

    it('should keep the abort code for a caller abort', async () => {
        const client = new Client({
            baseURL: 'https://api.test/',
            transport: createHangingTransport(),
            timeout: 1000,
        });
        const controller = new AbortController();

        const promise = client.get('slow', { signal: controller.signal });

        setTimeout(() => controller.abort(), 10);

        const error = await catchError(promise);

        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_ABORTED);
        expect(isClientErrorDueTimeout(error)).toBe(false);
        expect(isClientErrorDueNetworkIssue(error)).toBe(false);
    });

    it('should reject at once with the reason of an already aborted signal without dispatching', async () => {
        const transport = createHangingTransport();
        const client = new Client({
            baseURL: 'https://api.test/',
            transport,
            timeout: 1000,
        });
        const controller = new AbortController();
        const reason = new DOMException('stop', 'AbortError');

        controller.abort(reason);

        const error = await catchError(client.get('slow', { signal: controller.signal }));

        expect(transport.requests).toHaveLength(0);
        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_ABORTED);
        expect(isClientError(error) && error.cause).toBe(reason);
    });

    it.each([0, -1, NaN, Infinity])('should not arm a timeout of %s', async (timeout) => {
        const transport = createDelayedTransport(30);
        const client = new Client({
            baseURL: 'https://api.test/',
            transport,
            timeout,
        });

        const response = await client.get('slow', { timeout });

        expect(response.data).toEqual({ ok: true });
        expect(transport.requests.at(-1)!.signal).toBeUndefined();
    });

    it('should never hand the timeout to the transport', async () => {
        const transport = new MemoryTransport();
        const client = new Client({
            baseURL: 'https://api.test/',
            transport,
            timeout: 1000,
        });

        await client.get('fast');
        await client.get('fast', { timeout: 500 });

        for (const request of transport.requests) {
            expect(Object.hasOwn(request, 'timeout')).toBe(false);
            expect(request.signal).toBeDefined();
        }
    });

    it('should hand the caller signal through when no timeout is set', async () => {
        const transport = new MemoryTransport();
        const client = new Client({ baseURL: 'https://api.test/', transport });
        const controller = new AbortController();

        await client.get('fast', { signal: controller.signal });

        expect(transport.requests.at(-1)!.signal).toBe(controller.signal);
    });

    it('should reject with a timeout error when the timeout elapses while the body is read', async () => {
        const transport = new MemoryTransport({
            fetch: (request) => {
                const body = new ReadableStream({
                    start(controller) {
                        controller.enqueue(new TextEncoder().encode('{"partial":'));
                    },
                    pull(controller) {
                        return waitForAbort(request).catch((e) => controller.error(e));
                    },
                });

                return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
            },
        });
        const client = new Client({
            baseURL: 'https://api.test/',
            transport,
            timeout: 20,
        });

        const error = await catchError(client.get('slow-body'));

        expect(isNetworkError(error)).toBe(true);
        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should arm a fresh timeout for a request retried by an error hook', async () => {
        let calls = 0;
        const transport = new MemoryTransport({
            fetch: (request) => {
                calls++;

                if (calls === 1) {
                    return waitForAbort(request);
                }

                return { status: 200, body: { ok: true } };
            },
        });
        const client = new Client({
            baseURL: 'https://api.test/',
            transport,
            timeout: 20,
        });

        client.on(HookName.REQUEST_ERROR, (error) => {
            if (calls === 1 && isClientErrorDueTimeout(error)) {
                return error.request;
            }

            throw error;
        });

        const response = await client.get('retry');

        expect(response.data).toEqual({ ok: true });
        expect(transport.requests[1].signal?.aborted).toBe(false);
    });
});
