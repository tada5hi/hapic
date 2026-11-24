/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
    Client,
    FetchTransport,
    HookName,
    MemoryTransport,
} from '../../../src';
import type {
    TransportRequest,
    UploadProgressEvent,
} from '../../../src';

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

    it('should count a stream body while fetch reads it', async () => {
        const calls : FetchCall[] = [];
        const events : UploadProgressEvent[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });
        const body = new Blob([new Uint8Array(200_000)]).stream();

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            headers: { 'content-length': '200000' },
            body,
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        const { init } = calls[0]!;

        expect(init).not.toHaveProperty('onUploadProgress');
        expect(init.body).toBeInstanceOf(ReadableStream);
        expect(init.body).not.toBe(body);
        expect(init.duplex).toBe('half');

        expect(events.length).toBeGreaterThan(0);
        expect(events.at(-1)).toEqual({ loaded: 200_000, total: 200_000 });

        for (let i = 1; i < events.length; i++) {
            expect(events[i]!.loaded).toBeGreaterThan(events[i - 1]!.loaded);
        }
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

    it('should send any other body as it is and report one event', async () => {
        const calls : FetchCall[] = [];
        const events : UploadProgressEvent[] = [];
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });
        const body = new Uint8Array(10);

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body,
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: 'héllo',
            keepalive: true,
            proxy: false,
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        expect(calls[0]!.init.body).toBe(body);
        expect(calls[0]!.init).not.toHaveProperty('duplex');
        expect(calls[0]!.init).not.toHaveProperty('onUploadProgress');
        expect(calls[1]!.init.body).toBe('héllo');
        expect(events).toEqual([
            { loaded: 10, total: 10 },
            { loaded: 6, total: 6 },
        ]);
    });

    it('should report nothing for a body of unknown size', async () => {
        const calls : FetchCall[] = [];
        const listener = vi.fn();
        const transport = new FetchTransport({ fetch: createFetchStub(calls) });
        const formData = new FormData();

        formData.append('file', new Blob(['hello']), 'a.txt');

        await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: formData,
            proxy: false,
            onUploadProgress: listener,
        });

        expect(calls[0]!.init.body).toBe(formData);
        expect(listener).not.toHaveBeenCalled();
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
});

describe('src/transport/fetch (upload progress, server)', () => {
    async function withServer(
        handler: http.RequestListener,
        fn: (baseURL: string) => Promise<void>,
    ) {
        const server = http.createServer(handler);

        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', resolve);
        });

        try {
            const { port } = server.address() as AddressInfo;

            await fn(`http://127.0.0.1:${port}/`);
        } finally {
            server.closeAllConnections();
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
    }

    it('should upload a stream body with its content-length', async () => {
        const received : { length?: string, bytes: number }[] = [];

        await withServer((req, res) => {
            let bytes = 0;

            req.on('data', (chunk: Buffer) => {
                bytes += chunk.length;
            });
            req.on('end', () => {
                received.push({ length: req.headers['content-length'], bytes });
                res.setHeader('content-type', 'application/json');
                res.end('{"ok":true}');
            });
        }, async (baseURL) => {
            const client = new Client({ baseURL, proxy: false });
            const events : UploadProgressEvent[] = [];

            const response = await client.post('media', new Blob([new Uint8Array(100_000)]).stream(), {
                headers: { 'content-length': '100000' },
                onUploadProgress: (event) => {
                    events.push(event);
                },
            });

            expect(response.data).toEqual({ ok: true });
            expect(received).toEqual([{ length: '100000', bytes: 100_000 }]);
            expect(events.at(-1)).toEqual({ loaded: 100_000, total: 100_000 });
        });
    });

    it('should let fetch follow a redirect of an upload and send it once per hop', async () => {
        const received : { url?: string, body: string }[] = [];

        await withServer((req, res) => {
            let body = '';

            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                received.push({ url: req.url, body });

                if (req.url === '/media') {
                    res.statusCode = 307;
                    res.setHeader('location', '/media/');
                    res.end();

                    return;
                }

                res.setHeader('content-type', 'application/json');
                res.end('{"ok":true}');
            });
        }, async (baseURL) => {
            const client = new Client({ baseURL, proxy: false });
            const events : UploadProgressEvent[] = [];

            const response = await client.post('media', 'hello', {
                onUploadProgress: (event) => {
                    events.push(event);
                },
            });

            expect(response.data).toEqual({ ok: true });
            expect(received).toEqual([
                { url: '/media', body: 'hello' },
                { url: '/media/', body: 'hello' },
            ]);
            expect(events).toEqual([{ loaded: 5, total: 5 }]);
        });
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

    it('should use a client default listener', async () => {
        const transport = new MemoryTransport();
        const listener = () => {};
        const client = new Client({ transport, onUploadProgress: listener });

        await client.post('https://api.test/', 'data');

        expect(transport.requests[0]!.onUploadProgress).toBe(listener);
    });
});
