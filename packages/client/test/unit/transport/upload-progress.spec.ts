/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/* eslint-disable max-classes-per-file */

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
    Client,
    FetchTransport,
    HookName,
    MemoryTransport,
} from '../../../src';
import type {
    FetchUploadStrategy,
    TransportRequest,
    UploadProgressEvent,
} from '../../../src';
import { FakeXMLHttpRequest } from './mock-util';

type FetchCall = { url: string, init: RequestInit & Record<string, any> };

/**
 * A fetch stub reading the request body to its end, as a real fetch would.
 */
function createFetchStub(calls: FetchCall[]) {
    return async (url: string, init: RequestInit = {}) => {
        calls.push({ url, init: init as FetchCall['init'] });

        if (init.body instanceof ReadableStream) {
            await new Response(init.body).arrayBuffer();
        }

        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
    };
}

describe('src/transport/fetch (upload progress)', () => {
    beforeEach(() => {
        FakeXMLHttpRequest.reset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should keep a request without listener as it is', async () => {
        const calls : FetchCall[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });
        const body = new Uint8Array([1, 2, 3]);

        await transport.dispatch({
            url: 'https://api.test/', 
            method: 'POST', 
            body, 
            proxy: false,
        });

        expect(calls[0]!.init.body).toBe(body);
        expect(calls[0]!.init.duplex).toBeUndefined();
    });

    it('should not pass the listener on to fetch', async () => {
        const calls : FetchCall[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'GET',
            proxy: false,
            onUploadProgress: () => {},
        });

        expect(calls[0]!.init).not.toHaveProperty('onUploadProgress');
        expect(calls[0]!.init.body).toBeUndefined();
    });

    it('should send a counting stream with duplex half in Node.js', async () => {
        const calls : FetchCall[] = [];
        const events : UploadProgressEvent[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });
        const body = new Uint8Array(200_000);

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body,
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        const { init } = calls[0]!;

        expect(init).not.toHaveProperty('onUploadProgress');
        expect(init.body).toBeInstanceOf(ReadableStream);
        expect(init.duplex).toBe('half');
        expect(new Headers(init.headers).get('content-length')).toBe('200000');

        expect(events.length).toBeGreaterThan(0);
        expect(events.at(-1)).toEqual({ loaded: 200_000, total: 200_000 });

        for (let i = 1; i < events.length; i++) {
            expect(events[i]!.loaded).toBeGreaterThan(events[i - 1]!.loaded);
        }
    });

    it('should keep the content-type of form data and url search params', async () => {
        const calls : FetchCall[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });

        const formData = new FormData();

        formData.append('file', new Blob(['hello']), 'a.txt');

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: formData,
            onUploadProgress: () => {},
            proxy: false,
        });

        const formHeaders = new Headers(calls[0]!.init.headers);

        expect(formHeaders.get('content-type')).toMatch(/^multipart\/form-data; ?boundary=/);
        expect(Number(formHeaders.get('content-length'))).toBeGreaterThan(5);

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: new URLSearchParams({ a: '1' }),
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
            onUploadProgress: () => {},
            proxy: false,
        });

        const searchHeaders = new Headers(calls[1]!.init.headers);

        expect(searchHeaders.get('content-type')).toBe('application/x-www-form-urlencoded;charset=utf-8');
        expect(searchHeaders.get('content-length')).toBe('3');
    });

    it('should count a stream body of unknown size', async () => {
        const calls : FetchCall[] = [];
        const events : UploadProgressEvent[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });

        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                controller.enqueue(new Uint8Array(3));
                controller.enqueue(new Uint8Array(4));
                controller.close();
            },
        });

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body,
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        expect(new Headers(calls[0]!.init.headers).has('content-length')).toBe(false);
        expect(events).toEqual([
            { loaded: 3, total: undefined },
            { loaded: 7, total: undefined },
        ]);
    });

    it('should send by XMLHttpRequest where one exists', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);

        const events : UploadProgressEvent[] = [];

        FakeXMLHttpRequest.onSend = (xhr) => {
            xhr.progress(4, 4);
            xhr.respond({
                status: 200, 
                headers: 'content-type: text/plain', 
                body: 'ok', 
            });
        };

        const client = new Client({ baseURL: 'https://api.test/' });
        const response = await client.post('media', 'data', {
            onUploadProgress: (event) => {
                events.push(event);
            }, 
        });

        expect(FakeXMLHttpRequest.instances).toHaveLength(1);
        expect(response.data).toBe('ok');
        expect(events).toEqual([{ loaded: 4, total: 4 }]);
    });

    it('should not use XMLHttpRequest with a custom fetch or a proxy options object', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);

        const calls : FetchCall[] = [];
        const custom = new FetchTransport({ fetch: createFetchStub(calls) });

        await custom.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: 'data',
            proxy: false,
            onUploadProgress: () => {},
        });

        expect(FakeXMLHttpRequest.instances).toHaveLength(0);
        expect(calls[0]!.init.duplex).toBe('half');

        class InspectTransport extends FetchTransport {
            strategy(request: TransportRequest) {
                return this.resolveUploadStrategy(request);
            }
        }

        const inspect = new InspectTransport();
        const request = { url: 'https://api.test/', body: 'data' };

        expect(inspect.strategy({ ...request, proxy: { url: 'http://proxy.test' } })).toBe('stream');
        expect(inspect.strategy({ ...request, proxy: true })).toBe('xhr');
        expect(inspect.strategy({ ...request, body: new ReadableStream() })).toBe('stream');
    });

    it('should not use XMLHttpRequest for a stream response', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);

        class InspectTransport extends FetchTransport {
            strategy(request: TransportRequest) {
                return this.resolveUploadStrategy(request);
            }
        }

        const inspect = new InspectTransport();

        expect(inspect.strategy({
            url: 'https://api.test/', 
            body: 'data', 
            responseType: 'stream', 
        })).toBe('stream');
        expect(inspect.strategy({
            url: 'https://api.test/', 
            body: 'data', 
            responseType: 'json', 
        })).toBe('xhr');
    });

    it('should not pass the response type on to fetch', async () => {
        const calls : FetchCall[] = [];
        const client = new Client({
            baseURL: 'https://api.test/',
            proxy: false,
            transport: new FetchTransport({ fetch: createFetchStub(calls) }),
        });

        await client.post('media', 'data', { responseType: 'text' });
        await client.post('media', 'data', { responseType: 'stream', onUploadProgress: () => {} });

        expect(Object.keys(calls[0]!.init).sort()).toEqual(['body', 'headers', 'method']);
        expect(calls[1]!.init).not.toHaveProperty('responseType');
    });

    it('should report one event once the body is sent elsewhere', async () => {
        class PlainTransport extends FetchTransport {
            protected override resolveUploadStrategy() : FetchUploadStrategy {
                return 'fetch';
            }
        }

        const calls : FetchCall[] = [];
        const events : UploadProgressEvent[] = [];
        const transport = new PlainTransport({ fetch: createFetchStub(calls) });

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: 'héllo',
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        expect(calls[0]!.init.body).toBe('héllo');
        expect(calls[0]!.init).not.toHaveProperty('onUploadProgress');
        expect(events).toEqual([{ loaded: 6, total: 6 }]);
    });

    it('should report the upload of form data to a server', async () => {
        const received : {
            length?: string, 
            type?: string, 
            bytes: number 
        }[] = [];
        const server = http.createServer((req, res) => {
            let bytes = 0;

            req.on('data', (chunk: Buffer) => {
                bytes += chunk.length;
            });
            req.on('end', () => {
                received.push({
                    length: req.headers['content-length'],
                    type: req.headers['content-type'],
                    bytes,
                });
                res.setHeader('content-type', 'application/json');
                res.end('{"ok":true}');
            });
        });

        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', resolve);
        });

        try {
            const { port } = server.address() as AddressInfo;
            const client = new Client({ baseURL: `http://127.0.0.1:${port}/`, proxy: false });
            const events : UploadProgressEvent[] = [];

            const formData = new FormData();

            formData.append('file', new Blob([new Uint8Array(100_000)]), 'a.bin');

            const response = await client.post('media', formData, {
                onUploadProgress: (event) => {
                    events.push(event);
                }, 
            });

            expect(response.data).toEqual({ ok: true });
            expect(received[0]!.type).toMatch(/^multipart\/form-data; ?boundary=/);
            expect(Number(received[0]!.length)).toBe(received[0]!.bytes);
            expect(events.at(-1)).toEqual({ loaded: received[0]!.bytes, total: received[0]!.bytes });
        } finally {
            server.close();
        }
    });
});

describe('src/module (upload progress)', () => {
    it('should hand the listener to the transport and keep it on a retry', async () => {
        let count = 0;
        const transport = new MemoryTransport({
            fetch: () => {
                count++;

                return { status: count === 1 ? 401 : 200 };
            },
        });

        const client = new Client({ baseURL: 'https://api.test/', transport });

        client.on(HookName.RESPONSE_ERROR, (error) => error.request);

        const listener = () => {};

        await client.post('media', 'data', { onUploadProgress: listener });

        expect(transport.requests).toHaveLength(2);
        expect(transport.requests[0]!.onUploadProgress).toBe(listener);
        expect(transport.requests[1]!.onUploadProgress).toBe(listener);
    });

    it('should hand the response type to the transport', async () => {
        const transport = new MemoryTransport();
        const client = new Client({ baseURL: 'https://api.test/', transport });

        await client.get('events', { responseType: 'stream' });
        await client.get('data');

        expect(transport.requests[0]!.responseType).toBe('stream');
        expect(transport.requests[1]!.responseType).toBeUndefined();
    });

    it('should use a client default listener', async () => {
        const transport = new MemoryTransport();
        const listener = () => {};
        const client = new Client({ transport, onUploadProgress: listener });

        await client.post('https://api.test/', 'data');

        expect(transport.requests[0]!.onUploadProgress).toBe(listener);
    });
});
