/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { KeyValueVersion, MountAPI } from '../../../src';

describe('src/domains/mount', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.create(
            'key',
            { type: 'kv' },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('sys/mounts/key');
        expect(JSON.parse(req.body as string)).toEqual({
            type: 'kv',
            config: {},
            options: {},
        });
    });

    it('should not mutate the payload passed to create', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new MountAPI({ client: createClient({ transport }) });

        const payload = { type: 'kv' as const, description: 'foo' };

        await api.create('key', payload);

        expect(payload).toEqual({ type: 'kv', description: 'foo' });

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('sys/mounts/key');
        expect(JSON.parse(req.body as string)).toEqual({
            type: 'kv',
            description: 'foo',
            config: {},
            options: {},
        });
    });

    it('should keep given options and config on create', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.create('key', {
            type: 'kv',
            options: { version: KeyValueVersion.TWO },
            config: { max_lease_ttl: '1h' },
        });

        const req = transport.requests.at(-1)!;

        expect(JSON.parse(req.body as string)).toEqual({
            type: 'kv',
            options: { version: '2' },
            config: { max_lease_ttl: '1h' },
        });
    });

    it('should use the string kv versions vault returns', () => {
        expect(KeyValueVersion.ONE).toBe('1');
        expect(KeyValueVersion.TWO).toBe('2');
    });

    it('should tune resource', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.update(
            'key',
            { description: 'foo', max_lease_ttl: '1h' },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('sys/mounts/key/tune');
        expect(JSON.parse(req.body as string)).toEqual({
            description: 'foo',
            max_lease_ttl: '1h',
        });
    });

    it('should read the tune configuration', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {
                    data: {
                        default_lease_ttl: 3600, 
                        max_lease_ttl: 7200, 
                        force_no_cache: false, 
                    }, 
                },
            }),
        });

        const api = new MountAPI({ client: createClient({ transport }) });

        const response = await api.getTune('my-mount');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('sys/mounts/my-mount/tune');
        expect(req.body).toBeUndefined();
        expect(response.data.default_lease_ttl).toBe(3600);
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.getMany();

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('sys/mounts');
        expect(req.body).toBeUndefined();
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.getOne('foo');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('sys/mounts/foo');
        expect(req.body).toBeUndefined();
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 200 }) });

        const api = new MountAPI({ client: createClient({ transport }) });

        await api.delete('foo');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('sys/mounts/foo');
        expect(req.body).toBeUndefined();
    });
});
