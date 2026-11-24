/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client,
    ErrorCode,
    MemoryTransport,
    XhrTransport,
    isNetworkError,
    isTransport,
} from '../../../src';
import type { UploadProgressEvent } from '../../../src';
import { FakeXMLHttpRequest } from './mock-util';

describe('src/transport/xhr', () => {
    beforeEach(() => {
        FakeXMLHttpRequest.reset();
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should be a transport', () => {
        expect(isTransport(new XhrTransport())).toBe(true);
    });

    it('should send the request and build an unread response', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => xhr.respond({
            status: 201,
            statusText: 'Created',
            headers: 'Content-Type: application/json\r\nX-Id: 1\r\n',
            body: '{"id":1}',
        });

        const transport = new XhrTransport();
        const response = await transport.dispatch({
            url: 'https://api.test/media',
            method: 'post',
            headers: { 'x-file-name': 'a.png' },
            body: 'payload',
            credentials: 'include',
        });

        const [xhr] = FakeXMLHttpRequest.instances;

        expect(xhr!.method).toBe('POST');
        expect(xhr!.url).toBe('https://api.test/media');
        expect(xhr!.requestHeaders['x-file-name']).toBe('a.png');
        expect(xhr!.body).toBe('payload');
        expect(xhr!.withCredentials).toBe(true);
        expect(xhr!.responseType).toBe('arraybuffer');

        expect(response.bodyUsed).toBe(false);
        expect(response.status).toBe(201);
        expect(response.statusText).toBe('Created');
        expect(response.headers.get('content-type')).toBe('application/json');
        expect(response.headers.get('x-id')).toBe('1');
        expect(await response.json()).toEqual({ id: 1 });
    });

    it('should set the response url and redirected', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => xhr.respond({ status: 200, body: '' });

        const transport = new XhrTransport();
        const direct = await transport.dispatch({ url: 'https://api.test/a' });

        expect(direct.url).toBe('https://api.test/a');
        expect(direct.redirected).toBe(false);
        expect(Object.keys(direct)).not.toContain('url');

        FakeXMLHttpRequest.onSend = (xhr) => {
            xhr.responseURL = 'https://api.test/b';
            xhr.respond({ status: 200, body: '' });
        };

        const moved = await transport.dispatch({ url: 'https://api.test/a' });

        expect(moved.url).toBe('https://api.test/b');
        expect(moved.redirected).toBe(true);
    });

    it('should not report a redirect for a url that only differs in its serialization', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => {
            xhr.responseURL = 'https://api.test/a%20b?x=1';
            xhr.respond({ status: 200, body: '' });
        };

        const transport = new XhrTransport();
        const response = await transport.dispatch({ url: 'https://API.test/a b?x=1' });

        expect(response.url).toBe('https://api.test/a%20b?x=1');
        expect(response.redirected).toBe(false);
    });

    it('should pass a stream response request to the fallback transport', async () => {
        const fallback = new MemoryTransport();
        const transport = new XhrTransport({ fallback });

        await transport.dispatch({ url: 'https://api.test/', responseType: 'stream' });

        expect(FakeXMLHttpRequest.instances).toHaveLength(0);
        expect(fallback.requests).toHaveLength(1);
    });

    it('should build a null body for 204 and HEAD', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => xhr.respond({ status: 204, body: '' });

        const transport = new XhrTransport();
        const noContent = await transport.dispatch({ url: 'https://api.test/', method: 'DELETE' });

        expect(noContent.body).toBeNull();

        FakeXMLHttpRequest.onSend = (xhr) => xhr.respond({ status: 200, body: '' });

        const head = await transport.dispatch({ url: 'https://api.test/', method: 'HEAD' });

        expect(head.body).toBeNull();
    });

    it('should resolve a 4xx/5xx response and let the client throw', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => xhr.respond({
            status: 500, 
            statusText: 'Error', 
            body: 'boom', 
        });

        const transport = new XhrTransport();
        const response = await transport.dispatch({ url: 'https://api.test/' });

        expect(response.status).toBe(500);
    });

    it('should report upload progress', async () => {
        const events : UploadProgressEvent[] = [];

        FakeXMLHttpRequest.onSend = (xhr) => {
            xhr.progress(5);
            xhr.progress(5, 10);
            xhr.progress(10, 10);
            xhr.respond({ status: 200 });
        };

        const client = new Client({ baseURL: 'https://api.test/', transport: new XhrTransport() });

        await client.post('media', new Uint8Array(10), {
            onUploadProgress: (event) => {
                events.push(event);
            },
        });

        expect(events).toEqual([
            { loaded: 5, total: undefined },
            { loaded: 5, total: 10 },
            { loaded: 10, total: 10 },
        ]);
    });

    it('should ignore an error thrown by the listener', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => {
            xhr.progress(1, 1);
            xhr.respond({ status: 200 });
        };

        const transport = new XhrTransport();
        const response = await transport.dispatch({
            url: 'https://api.test/',
            method: 'POST',
            body: 'a',
            onUploadProgress: () => {
                throw new Error('listener');
            },
        });

        expect(response.status).toBe(200);
    });

    it('should reject a network error as a network error', async () => {
        FakeXMLHttpRequest.onSend = (xhr) => xhr.fail();

        const client = new Client({ baseURL: 'https://api.test/', transport: new XhrTransport() });

        const error = await client.get('x').catch((e) => e);

        expect(isNetworkError(error)).toBe(true);
        expect(error.code).toBe(ErrorCode.CONNECTION_CLOSED);
    });

    it('should abort by the caller signal (ECONNABORTED)', async () => {
        const controller = new AbortController();

        FakeXMLHttpRequest.onSend = () => {
            controller.abort();
        };

        const client = new Client({ baseURL: 'https://api.test/', transport: new XhrTransport() });

        const error = await client.post('x', 'body', { signal: controller.signal }).catch((e) => e);

        expect(FakeXMLHttpRequest.instances[0]!.aborted).toBe(true);
        expect(isNetworkError(error)).toBe(true);
        expect(error.code).toBe(ErrorCode.CONNECTION_ABORTED);
    });

    it('should abort by the timeout (ETIMEDOUT)', async () => {
        const client = new Client({ baseURL: 'https://api.test/', transport: new XhrTransport() });

        const error = await client.post('x', 'body', { timeout: 5 }).catch((e) => e);

        expect(FakeXMLHttpRequest.instances[0]!.aborted).toBe(true);
        expect(error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
    });

    it('should reject an already aborted signal without sending', async () => {
        const controller = new AbortController();
        const reason = new Error('stop');

        controller.abort(reason);

        const transport = new XhrTransport();

        await expect(transport.dispatch({ url: 'https://api.test/', signal: controller.signal }))
            .rejects.toBe(reason);
        expect(FakeXMLHttpRequest.instances).toHaveLength(0);
    });

    it('should pass a stream body to the fallback transport', async () => {
        const fallback = new MemoryTransport();
        const transport = new XhrTransport({ fallback });

        const body = new ReadableStream();

        await transport.dispatch({
            url: 'https://api.test/', 
            method: 'POST', 
            body, 
        });

        expect(FakeXMLHttpRequest.instances).toHaveLength(0);
        expect(fallback.requests.at(-1)!.body).toBe(body);
    });

    it('should use the fallback transport without XMLHttpRequest', async () => {
        vi.unstubAllGlobals();

        const fallback = new MemoryTransport();
        const transport = new XhrTransport({ fallback });

        await transport.dispatch({
            url: 'https://api.test/', 
            method: 'POST', 
            body: 'a', 
        });

        expect(fallback.requests).toHaveLength(1);
    });
});
