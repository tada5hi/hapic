/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient, isClientErrorWithStatusCode } from 'hapic';
import { KeyValueV1API } from '../../../src';

describe('src/domains/key-value/v1', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV1API({ client: createClient({ transport }) });

        await api.create(
            'secrets',
            'key',
            { bar: 'baz' },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('secrets/key');
        expect(JSON.parse(req.body as string)).toEqual({ bar: 'baz' });
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV1API({ client: createClient({ transport }) });

        await api.getOne('foo', 'bar');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('foo/bar');
        expect(req.body).toBeUndefined();
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 200 }) });

        const api = new KeyValueV1API({ client: createClient({ transport }) });

        await api.delete('foo', 'bar');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('foo/bar');
        expect(req.body).toBeUndefined();
    });

    describe('getKeys', () => {
        it('should return the listed keys', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: { data: { keys: ['foo', 'foo/'] } },
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            await expect(api.getKeys('secret')).resolves.toEqual(['foo', 'foo/']);

            let req = transport.requests.at(-1)!;

            expect(req.method).toBe('GET');
            expect(req.url).toBe('secret/?list=true');
            expect(req.body).toBeUndefined();

            await api.getKeys('secret', 'a/b');

            req = transport.requests.at(-1)!;

            expect(req.url).toBe('secret/a/b?list=true');
        });

        it('should return an empty list on 404', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 404,
                    headers: { 'content-type': 'application/json' },
                    body: { errors: [] },
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            await expect(api.getKeys('secret', 'a')).resolves.toEqual([]);
        });

        it('should throw on 403', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 403,
                    headers: { 'content-type': 'application/json' },
                    body: { errors: ['permission denied'] },
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            const error = await api.getKeys('secret', 'a').catch((e) => e);

            expect(isClientErrorWithStatusCode(error, 403)).toBe(true);
        });
    });

    describe('findOne', () => {
        it('should return the same value as getOne', async () => {
            const body = { data: { foo: 'bar' } };
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body,
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            const found = await api.findOne('secret', 'bar');

            expect(transport.requests.at(-1)!.url).toBe('secret/bar');
            expect(found).toEqual(await api.getOne('secret', 'bar'));
            expect(found).toEqual(body);
        });

        it('should return undefined on 404', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 404,
                    headers: { 'content-type': 'application/json' },
                    body: { errors: [] },
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            await expect(api.findOne('secret', 'bar')).resolves.toBeUndefined();
        });

        it('should throw on 500', async () => {
            const transport = new MemoryTransport({
                fetch: () => ({
                    status: 500,
                    headers: { 'content-type': 'application/json' },
                    body: { errors: ['internal error'] },
                }),
            });

            const api = new KeyValueV1API({ client: createClient({ transport }) });

            const error = await api.findOne('secret', 'bar').catch((e) => e);

            expect(isClientErrorWithStatusCode(error, 500)).toBe(true);
        });
    });
});
