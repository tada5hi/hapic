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
    MemoryTransport,
    isClientError,
    isClientErrorDueTimeout,
    isNetworkError,
} from '../../../src';

function hang() : Promise<never> {
    return new Promise(() => {});
}

function createEndlessStream() : ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode('{"partial":'));
        },
        pull() {
            // never delivers more data and never closes
            return hang();
        },
    });
}

async function catchError(promise: Promise<unknown>) : Promise<unknown> {
    try {
        await promise;
    } catch (e) {
        return e;
    }

    throw new Error('Expected the promise to reject.');
}

function dispatchWith(transport: MemoryTransport, signal: AbortSignal) {
    return transport.dispatch({ url: 'https://api.test/x', signal } as TransportRequest);
}

function trackListeners(signal: AbortSignal) : () => number {
    let active = 0;
    const add = signal.addEventListener.bind(signal);
    const remove = signal.removeEventListener.bind(signal);

    signal.addEventListener = ((type: string, fn: any, options?: any) => {
        if (type === 'abort') {
            active++;
        }

        add(type, fn, options);
    }) as typeof signal.addEventListener;

    signal.removeEventListener = ((type: string, fn: any, options?: any) => {
        if (type === 'abort') {
            active--;
        }

        remove(type, fn, options);
    }) as typeof signal.removeEventListener;

    return () => active;
}

describe('src/transport/memory (signal)', () => {
    it('should keep url, redirected and type of a returned Response', async () => {
        const controller = new AbortController();
        const transport = new MemoryTransport({
            fetch: () => {
                const response = new Response('{}', { status: 200 });

                Object.defineProperties(response, {
                    url: { value: 'https://api.test/moved', configurable: true },
                    redirected: { value: true, configurable: true },
                    type: { value: 'cors', configurable: true },
                });

                return response;
            },
        });

        const response = await dispatchWith(transport, controller.signal);

        expect(response.url).toBe('https://api.test/moved');
        expect(response.redirected).toBe(true);
        expect(response.type).toBe('cors');
    });

    it('should reject when the handler aborts the signal before returning', async () => {
        const controller = new AbortController();
        const reason = new Error('aborted inside the handler');
        const transport = new MemoryTransport({
            fetch: () => {
                controller.abort(reason);

                return { body: createEndlessStream() };
            },
        });

        const error = await catchError(dispatchWith(transport, controller.signal));

        expect(error).toBe(reason);
    });

    describe('pending fetch handler', () => {
        it('should reject a caller abort as ECONNABORTED', async () => {
            const client = new Client({
                baseURL: 'https://api.test/',
                transport: new MemoryTransport({ fetch: () => hang() }),
            });
            const controller = new AbortController();

            const promise = client.get('slow', { signal: controller.signal });

            setTimeout(() => controller.abort(), 10);

            const error = await catchError(promise);

            expect(isNetworkError(error)).toBe(true);
            expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_ABORTED);
            expect(isClientErrorDueTimeout(error)).toBe(false);
            expect(isClientError(error) && error.cause).toBe(controller.signal.reason);
        });

        it('should reject an elapsed timeout option as ETIMEDOUT', async () => {
            const client = new Client({
                baseURL: 'https://api.test/',
                transport: new MemoryTransport({ fetch: () => hang() }),
                timeout: 20,
            });

            const error = await catchError(client.get('slow'));

            expect(isNetworkError(error)).toBe(true);
            expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
            expect(isClientErrorDueTimeout(error)).toBe(true);
        });

        it('should reject an already aborted signal with its reason without calling the handler', async () => {
            const handler = vi.fn(() => ({ status: 200 }));
            const transport = new MemoryTransport({ fetch: handler });
            const controller = new AbortController();
            const reason = new Error('stop');

            controller.abort(reason);

            const error = await catchError(dispatchWith(transport, controller.signal));

            expect(error).toBe(reason);
            expect(handler).not.toHaveBeenCalled();
            expect(transport.requests).toHaveLength(1);
        });

        it('should keep the handler error when the signal does not abort', async () => {
            const failure = new Error('boom');
            const transport = new MemoryTransport({
                fetch: () => {
                    throw failure;
                },
            });

            const error = await catchError(dispatchWith(transport, new AbortController().signal));

            expect(error).toBe(failure);
        });
    });

    describe('response body', () => {
        it('should error a stream body read when the timeout elapses after dispatch', async () => {
            const client = new Client({
                baseURL: 'https://api.test/',
                transport: new MemoryTransport({
                    fetch: () => ({
                        status: 200,
                        headers: { 'content-type': 'application/json' },
                        body: createEndlessStream(),
                    }),
                }),
                timeout: 20,
            });

            const error = await catchError(client.get('slow-body'));

            expect(isNetworkError(error)).toBe(true);
            expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
        });

        it('should error the body of a returned Response on a caller abort', async () => {
            const client = new Client({
                baseURL: 'https://api.test/',
                transport: new MemoryTransport({
                    fetch: () => new Response(createEndlessStream(), {
                        status: 200,
                        headers: { 'content-type': 'application/json' },
                    }),
                }),
            });
            const controller = new AbortController();

            const promise = client.get('slow-body', { signal: controller.signal });

            setTimeout(() => controller.abort(), 10);

            const error = await catchError(promise);

            expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_ABORTED);
        });

        it('should keep status, statusText, headers and body of a bound response', async () => {
            const transport = new MemoryTransport({
                fetch: () => new Response('hello', {
                    status: 201,
                    statusText: 'Created',
                    headers: { 'x-test': '1' },
                }),
            });

            const response = await dispatchWith(transport, new AbortController().signal);

            expect(response.status).toBe(201);
            expect(response.statusText).toBe('Created');
            expect(response.headers.get('x-test')).toBe('1');
            expect(await response.text()).toBe('hello');
        });

        it('should error a body read with the reason once the signal aborts', async () => {
            const transport = new MemoryTransport({ fetch: () => ({ status: 200, body: createEndlessStream() }) });
            const controller = new AbortController();
            const reason = new Error('stop');

            const response = await dispatchWith(transport, controller.signal);
            const read = catchError(response.text());

            controller.abort(reason);

            expect(await read).toBe(reason);
        });
    });

    describe('discarded and foreign bodies', () => {
        it('should cancel the body of a response that arrives after the abort', async () => {
            const controller = new AbortController();
            const cancelled = vi.fn();
            const handler = Promise.withResolvers<Response>();
            const transport = new MemoryTransport({ fetch: () => handler.promise });

            const pending = catchError(dispatchWith(transport, controller.signal));

            controller.abort(new Error('stop'));
            await pending;

            handler.resolve(new Response(new ReadableStream({ cancel: cancelled })));
            await vi.waitFor(() => expect(cancelled).toHaveBeenCalled());
        });

        it('should return a response without a web stream body as it is', async () => {
            const controller = new AbortController();
            const response = new Response('ok');

            // a node-fetch-native/node response carries a node stream
            Object.defineProperty(response, 'body', { value: { pipe() {} } });

            const transport = new MemoryTransport({ fetch: () => response });

            await expect(dispatchWith(transport, controller.signal)).resolves.toBe(response);
        });
    });

    describe('listener cleanup', () => {
        it('should remove every abort listener once a body-less response settled', async () => {
            const controller = new AbortController();
            const active = trackListeners(controller.signal);
            const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

            await dispatchWith(transport, controller.signal);

            expect(active()).toBe(0);
        });

        it('should remove every abort listener once the body is read', async () => {
            const controller = new AbortController();
            const active = trackListeners(controller.signal);
            const transport = new MemoryTransport({ fetch: () => ({ status: 200, body: { ok: true } }) });

            const response = await dispatchWith(transport, controller.signal);

            expect(await response.json()).toEqual({ ok: true });
            expect(active()).toBe(0);
        });

        it('should remove every abort listener once the handler rejected', async () => {
            const controller = new AbortController();
            const active = trackListeners(controller.signal);
            const transport = new MemoryTransport({ fetch: () => Promise.reject(new Error('boom')) });

            await catchError(dispatchWith(transport, controller.signal));

            expect(active()).toBe(0);
        });

        it('should remove every abort listener once the body is cancelled', async () => {
            const controller = new AbortController();
            const active = trackListeners(controller.signal);
            const transport = new MemoryTransport({ fetch: () => ({ status: 200, body: createEndlessStream() }) });

            const response = await dispatchWith(transport, controller.signal);

            await response.body!.cancel();

            expect(active()).toBe(0);
        });
    });
});
