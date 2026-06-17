/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client,
    FetchTransport,
    HeaderName,
    HookName,
    MemoryTransport,
    isClientError,
    isTransport,
} from '../../src';

describe('src/transport', () => {
    describe('request construction', () => {
        it('should resolve baseURL + query (incl. bigint coercion)', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { id: 1 },
                }),
            });

            const client = new Client({ baseURL: 'https://api.test/', transport });
            const res = await client.get('users', {
                query: { page: 2, big: 9007199254740993n },
            });

            expect(res.data).toEqual({ id: 1 });
            expect(transport.requests).toHaveLength(1);

            const url = new URL(transport.requests.at(-1)!.url);
            expect(url.origin + url.pathname).toBe('https://api.test/users');
            expect(url.searchParams.get('page')).toBe('2');
            expect(url.searchParams.get('big')).toBe('9007199254740993');
        });

        it('should merge per-request headers over default headers', async () => {
            const transport = new MemoryTransport();
            const client = new Client({
                baseURL: 'https://api.test/',
                transport,
                headers: { 'x-default': 'a', 'x-both': 'default' },
            });

            await client.get('thing', {
                headers: { 'x-both': 'override', 'x-req': 'b' },
            });

            const headers = transport.requests.at(-1)!.headers as Headers;
            expect(headers.get('x-default')).toBe('a');
            expect(headers.get('x-both')).toBe('override');
            expect(headers.get('x-req')).toBe('b');
        });

        it('should strip the body for payload-less methods', async () => {
            const transport = new MemoryTransport();
            const client = new Client({ baseURL: 'https://api.test/', transport });

            await client.request({ method: 'GET', url: 'thing', body: { a: 1 } } as any);

            expect(transport.requests.at(-1)!.body).toBeUndefined();
        });

        it('should transform the body for write methods', async () => {
            const transport = new MemoryTransport();
            const client = new Client({ baseURL: 'https://api.test/', transport });

            await client.post('thing', { a: 1 });

            const init = transport.requests.at(-1)!;
            expect(init.body).toBe('{"a":1}');
            expect((init.headers as Headers).get(HeaderName.CONTENT_TYPE))
                .toBe('application/json');
        });
    });

    describe('decode', () => {
        it('should decode JSON by content-type', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { hello: 'world' },
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            const res = await client.get('x');
            expect(res.data).toEqual({ hello: 'world' });
        });

        it('should decode text by content-type', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'text/plain' },
                    body: 'plain',
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            const res = await client.get('x');
            expect(res.data).toBe('plain');
        });

        it('should honor an explicit responseType override', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { a: 1 },
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            const res = await client.get('x', { responseType: 'text' });
            expect(res.data).toBe('{"a":1}');
        });

        it('should expose a writable lazy data property', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { a: 1 },
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            const res = await client.get('x');
            expect(res.data).toEqual({ a: 1 });

            res.data = { a: 2 };
            expect(res.data).toEqual({ a: 2 });
        });
    });

    describe('errors & recovery', () => {
        it('should throw a ClientError for a 4xx/5xx status', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 404,
                    headers: { 'content-type': 'application/json' },
                    body: { error: 'not-found' },
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            let error: any;
            try {
                await client.get('missing');
            } catch (e) {
                error = e;
            }

            expect(isClientError(error)).toBe(true);
            expect(error.response.status).toBe(404);
        });

        it('should throw a ClientError on a dispatch failure', async () => {
            const transport = new MemoryTransport({
                fetch: () => { throw new Error('boom'); },
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            let error: any;
            try {
                await client.get('x');
            } catch (e) {
                error = e;
            }

            expect(isClientError(error)).toBe(true);
            expect(error.response).toBeUndefined();
        });

        it('should let an error hook recover by returning a Response', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({ status: 500, body: {} }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            client.on(HookName.RESPONSE_ERROR, () => new Response(null, {
                status: 200,
                headers: { 'x-recovered': 'yes' },
            }) as any);

            const res = await client.get('x');
            expect(res.status).toBe(200);
            expect(res.headers.get('x-recovered')).toBe('yes');
        });

        it('should let an error hook retry by returning request options', async () => {
            let call = 0;
            const transport = new MemoryTransport({
                fetch: () => (call++ === 0 ?
                    {
                        status: 401,
                        headers: { 'content-type': 'application/json' },
                        body: { error: 'unauthorized' },
                    } :
                    {
                        status: 200,
                        headers: { 'content-type': 'application/json' },
                        body: { ok: true },
                    }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            client.on(HookName.RESPONSE_ERROR, (error) => ({
                url: error.request.url,
                method: error.request.method,
                headers: { authorization: 'Bearer refreshed' },
            }));

            const res = await client.get('users');

            expect(res.data).toEqual({ ok: true });
            expect(transport.requests).toHaveLength(2);

            const retryHeaders = transport.requests[1].headers as Headers;
            expect(retryHeaders.get('authorization')).toBe('Bearer refreshed');
        });
    });

    describe('hooks', () => {
        it('should run request and response hooks against the pipeline', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { ok: 1 },
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            client.on(HookName.REQUEST, (options) => {
                (options.headers as Headers).set('x-hooked', '1');
                return options;
            });
            client.on(HookName.RESPONSE, (res) => {
                res.data = { mutated: true };
                return res;
            });

            const res = await client.get('x');

            expect((transport.requests.at(-1)!.headers as Headers).get('x-hooked')).toBe('1');
            expect(res.data).toEqual({ mutated: true });
        });
    });

    describe('FetchTransport', () => {
        it('should be detected by isTransport', () => {
            expect(isTransport(new FetchTransport())).toBe(true);
            expect(isTransport(new MemoryTransport())).toBe(true);
            expect(isTransport({})).toBe(false);
        });

        it('should dispatch through a custom fetch with proxy disabled', async () => {
            const calls: { url: string, init: any }[] = [];
            const fetchImpl = async (url: string, init: any) => {
                calls.push({ url, init });
                return new Response('{}', {
                    headers: { 'content-type': 'application/json' },
                });
            };

            const client = new Client({
                baseURL: 'https://api.test/',
                proxy: false,
                transport: new FetchTransport({ fetch: fetchImpl as any }),
            });

            await client.get('x');

            expect(calls).toHaveLength(1);
            expect(calls[0].url).toBe('https://api.test/x');
        });

        it('should dispatch through a custom fetch with the default proxy', async () => {
            const calls: { url: string, init: any }[] = [];
            const fetchImpl = async (url: string, init: any) => {
                calls.push({ url, init });
                return new Response('{}', {
                    headers: { 'content-type': 'application/json' },
                });
            };

            const client = new Client({
                baseURL: 'https://api.test/',
                transport: new FetchTransport({ fetch: fetchImpl as any }),
            });

            await client.get('x');

            expect(calls).toHaveLength(1);
            expect(calls[0].url).toBe('https://api.test/x');
        });
    });

    describe('boundary', () => {
        it('should keep pipeline-internal options out of the dispatched request', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: {},
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            await client.post('x', { a: 1 }, { responseType: 'json', query: { p: 1 } });

            const init = transport.requests.at(-1)! as unknown as Record<string, unknown>;
            // real fetch fields survive
            expect(init.method).toBe('POST');
            expect(init.body).toBe('{"a":1}');
            // pipeline-internal options do not leak across the boundary
            expect(init.baseURL).toBeUndefined();
            expect(init.responseType).toBeUndefined();
            expect(init.responseTransform).toBeUndefined();
            expect(init.transform).toBeUndefined();
            expect(init.query).toBeUndefined();
            expect(init.params).toBeUndefined();
            // the query was applied to the URL, not passed through as an option
            expect(transport.requests.at(-1)!.url).toBe('https://api.test/x?p=1');
        });

        it('should pass a binary response body through without JSON serialization', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/octet-stream' },
                    body: new Uint8Array([1, 2, 3]),
                }),
            });
            const client = new Client({ baseURL: 'https://api.test/', transport });

            const res = await client.get('x', { responseType: 'arrayBuffer' });

            expect(Array.from(new Uint8Array(res.data as ArrayBuffer))).toEqual([1, 2, 3]);
        });
    });
});
