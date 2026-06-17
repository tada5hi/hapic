/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { MountAPI } from '../../../src';

describe('src/domains/mount', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const api = new MountAPI({ client: createClient({ transport }) });
        await api.create(
            'key',
            {
                type: 'kv',
            },
        );

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('POST');
        expect(req.url).toBe('sys/mounts/key');
        expect(JSON.parse(req.init.body as string)).toEqual({
            type: 'kv',
            config: {},
            options: {},
        });
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const api = new MountAPI({ client: createClient({ transport }) });
        await api.getMany();

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('GET');
        expect(req.url).toBe('sys/mounts');
        expect(req.init.body).toBeUndefined();
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const api = new MountAPI({ client: createClient({ transport }) });
        await api.getOne('foo');

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('GET');
        expect(req.url).toBe('sys/mounts/foo');
        expect(req.init.body).toBeUndefined();
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({ status: 200 });

        const api = new MountAPI({ client: createClient({ transport }) });
        await api.delete('foo');

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('DELETE');
        expect(req.url).toBe('sys/mounts/foo');
        expect(req.init.body).toBeUndefined();
    });
});
