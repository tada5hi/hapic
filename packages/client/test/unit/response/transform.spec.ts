/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MemoryResponseInit, ResponseTransformer } from '../../../src';
import { 
    Client, 
    HookName, 
    MemoryTransport, 
    isHttpResponseError, 
} from '../../../src';

function createClient(
    response: MemoryResponseInit,
    responseTransform?: ResponseTransformer | ResponseTransformer[],
) {
    const transport = new MemoryTransport({ fetch: () => response });

    return new Client({
        baseURL: 'https://api.test/',
        transport,
        ...(responseTransform ? { responseTransform } : {}),
    });
}

const jsonEnvelope : MemoryResponseInit = {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: { result: { id: 1 } },
};

const unwrap : ResponseTransformer = (data) => data?.result ?? data;

describe('src/response/transform', () => {
    it('should pass the response headers and status to the transformer', async () => {
        const transform = vi.fn((data: any) => data);
        const client = createClient(jsonEnvelope, transform);

        await client.get('users/1');

        expect(transform).toHaveBeenCalledTimes(1);

        const [data, headers, status] = transform.mock.calls[0] as unknown as [any, Headers, number];

        expect(data).toEqual({ result: { id: 1 } });
        expect(headers.get('content-type')).toBe('application/json');
        expect(status).toBe(200);
    });

    it('should let a transformer tell an error body apart by its status', async () => {
        const transform : ResponseTransformer = (data, _headers, status) => (
            status >= 400 ? data.error : data.result
        );
        const client = createClient({
            status: 404,
            headers: { 'content-type': 'application/json' },
            body: { error: { code: 'NOT_FOUND' } },
        }, transform);

        const error = await client.get('users/999').catch((e) => e);

        expect(isHttpResponseError(error)).toBe(true);
        expect(error.response.data).toEqual({ code: 'NOT_FOUND' });
    });

    it('should keep the http error when a transformer throws on an error body', async () => {
        const hook = vi.fn((error: any) => {
            throw error;
        });
        const client = createClient({
            status: 401,
            headers: { 'content-type': 'application/json' },
            body: { error: 'expired' },
        }, [(data) => data, (data) => data.items.map((item: any) => item.id)]);

        client.on(HookName.RESPONSE_ERROR, hook);

        const error = await client.get('things').catch((e) => e);

        expect(isHttpResponseError(error)).toBe(true);
        expect(error.response.status).toBe(401);
        // the body is left untransformed
        expect(error.response.data).toEqual({ error: 'expired' });
        expect(hook).toHaveBeenCalledTimes(1);
    });

    it('should still throw when a transformer throws on a successful response', async () => {
        const client = createClient(jsonEnvelope, (data) => data.items.map((item: any) => item.id));

        const error = await client.get('things').catch((e) => e);

        expect(error).toBeInstanceOf(TypeError);
        expect(isHttpResponseError(error)).toBe(false);
    });

    it('should apply a client-level response transformer', async () => {
        const client = createClient(jsonEnvelope, unwrap);

        const res = await client.get('x');

        expect(res.data).toEqual({ id: 1 });
    });

    it('should apply a per-request response transformer', async () => {
        const client = createClient(jsonEnvelope);

        const res = await client.get('x', { responseTransform: unwrap });

        expect(res.data).toEqual({ id: 1 });
    });

    it('should replace the client-level transformer with a per-request one', async () => {
        const clientLevel = vi.fn(unwrap);
        const client = createClient(jsonEnvelope, clientLevel);

        const res = await client.get('x', { responseTransform: (data) => ({ wrapped: data }) });

        expect(clientLevel).not.toHaveBeenCalled();
        expect(res.data).toEqual({ wrapped: { result: { id: 1 } } });
    });

    it('should chain an array of transformers in order', async () => {
        const client = createClient(jsonEnvelope, [
            unwrap,
            (data) => ({ ...data, step: 'second' }),
            (data) => ({ ...data, last: data.step }),
        ]);

        const res = await client.get('x');

        expect(res.data).toEqual({
            id: 1, 
            step: 'second', 
            last: 'second', 
        });
    });

    it('should transform a text body', async () => {
        const client = createClient({
            status: 200,
            headers: { 'content-type': 'text/plain' },
            body: 'plain',
        }, (data: string) => data.toUpperCase());

        const res = await client.get('x');

        expect(res.data).toBe('PLAIN');
    });

    it('should transform a json body read with an explicit responseType', async () => {
        const client = createClient({
            status: 200,
            headers: { 'content-type': 'text/plain' },
            body: '{"result":{"id":1}}',
        }, unwrap);

        const res = await client.get('x', { responseType: 'json' });

        expect(res.data).toEqual({ id: 1 });
    });

    it('should transform an error body before the error is created', async () => {
        const client = createClient({
            status: 422,
            headers: { 'content-type': 'application/json' },
            body: { result: { message: 'invalid' } },
        }, unwrap);

        const error = await client.get('x').catch((e) => e);

        expect(isHttpResponseError(error)).toBe(true);
        expect(error.response.data).toEqual({ message: 'invalid' });
    });

    it('should expose the transformed error body to error hooks', async () => {
        const client = createClient({
            status: 500,
            headers: { 'content-type': 'application/json' },
            body: { result: { message: 'boom' } },
        }, unwrap);

        let seen : unknown;

        client.on(HookName.RESPONSE_ERROR, (error) => {
            seen = error.response?.data;

            throw error;
        });

        await expect(client.get('x')).rejects.toBeDefined();
        expect(seen).toEqual({ message: 'boom' });
    });

    it('should skip the transformer for a stream', async () => {
        const transformer = vi.fn(unwrap);
        const client = createClient(jsonEnvelope, transformer);

        const res = await client.get('x', { responseType: 'stream' });

        expect(transformer).not.toHaveBeenCalled();
        expect(res.data).toBeInstanceOf(ReadableStream);
    });

    it('should skip the transformer for a detected event stream', async () => {
        const transformer = vi.fn(unwrap);
        const client = createClient({
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
            body: 'data: x\n\n',
        }, transformer);

        const res = await client.get('x');

        expect(transformer).not.toHaveBeenCalled();
        expect(res.data).toBeInstanceOf(ReadableStream);
    });

    it('should apply the transformer once and let a later assignment win', async () => {
        const transformer = vi.fn(unwrap);
        const client = createClient(jsonEnvelope, transformer);

        const res = await client.get('x');

        expect(res.data).toEqual({ id: 1 });
        expect(res.data).toEqual({ id: 1 });
        expect(transformer).toHaveBeenCalledTimes(1);

        res.data = { replaced: true };

        expect(res.data).toEqual({ replaced: true });
        expect(transformer).toHaveBeenCalledTimes(1);
    });

    it('should honor a transformer installed by a request hook', async () => {
        const client = createClient(jsonEnvelope);

        client.on(HookName.REQUEST, (options) => {
            options.responseTransform = unwrap;

            return options;
        });

        const res = await client.get('x');

        expect(res.data).toEqual({ id: 1 });
    });
});
