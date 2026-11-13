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
