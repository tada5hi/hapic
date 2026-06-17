/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
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
            {
                bar: 'baz',
            },
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
});
