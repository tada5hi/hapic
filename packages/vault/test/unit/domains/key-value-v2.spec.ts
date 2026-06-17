/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { KeyValueV2API } from '../../../src';

describe('src/domains/key-value/v2', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });
        await api.create(
            'secrets',
            'key',
            {
                data: {
                    bar: 'baz',
                },
            },
        );

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('POST');
        expect(req.url).toBe('secrets/data/key');
        expect(JSON.parse(req.body as string)).toEqual({ data: { bar: 'baz' } });
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });
        await api.getOne('foo', 'bar');

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('GET');
        expect(req.url).toBe('foo/data/bar?version=0');
        expect(req.body).toBeUndefined();
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });
        await api.update(
            'secrets',
            'key',
            {
                data: {
                    boz: 'buz',
                },
            },
        );

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('PATCH');
        expect(req.url).toBe('secrets/data/key');
        expect(JSON.parse(req.body as string)).toEqual({ data: { boz: 'buz' } });
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 200 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });
        await api.delete('foo', 'bar');

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('foo/metadata/bar');
        expect(req.body).toBeUndefined();
    });

    it('should save resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });
        await api.save(
            'secrets',
            'key',
            {
                data: {
                    bar: 'baz',
                },
            },
        );

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('POST');
        expect(req.url).toBe('secrets/data/key');
        expect(JSON.parse(req.body as string)).toEqual({ data: { bar: 'baz' } });
    });
});
