/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { KeyValueV2API, VaultClient } from '../../../src';

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
            { data: { bar: 'baz' } },
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
            { data: { boz: 'buz' } },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('PATCH');
        expect(req.url).toBe('secrets/data/key');
        expect(typeof req.body).toBe('string');
        expect(JSON.parse(req.body as string)).toEqual({ data: { boz: 'buz' } });
        expect(new Headers(req.headers).get('content-type')).toBe('application/merge-patch+json');
    });

    it('should update resource with merge-patch content type through vault client', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const client = new VaultClient({ request: { transport } });

        await client.keyValueV2.update(
            'secrets',
            'key',
            { data: { boz: 'buz' } },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('PATCH');
        expect(req.url).toBe('secrets/data/key');
        expect(typeof req.body).toBe('string');
        expect(JSON.parse(req.body as string)).toEqual({ data: { boz: 'buz' } });
        expect(new Headers(req.headers).get('content-type')).toBe('application/merge-patch+json');

        await client.keyValueV2.create(
            'secrets',
            'key',
            { data: { bar: 'baz' } },
        );

        expect(new Headers(transport.requests.at(-1)!.headers).get('content-type')).toBe('application/json');
    });

    it('should soft delete the latest version', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        await api.delete('foo', 'bar');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('foo/data/bar');
        expect(req.body).toBeUndefined();
    });

    it('should delete metadata and all versions', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        await api.deleteMetadata('foo', 'a/b');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('foo/metadata/a/b');
        expect(req.body).toBeUndefined();
    });

    it.each([
        ['deleteVersions', 'POST', 'delete'],
        ['undeleteVersions', 'POST', 'undelete'],
        ['destroyVersions', 'PUT', 'destroy'],
    ] as const)('should %s', async (name, method, segment) => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        await api[name]('foo', 'a/b', [1, 2]);

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe(method);
        expect(req.url).toBe(`foo/${segment}/a/b`);
        expect(JSON.parse(req.body as string)).toEqual({ versions: [1, 2] });

        await api[name]('foo', 'a/b', []);

        const empty = transport.requests.at(-1)!;

        expect(transport.requests).toHaveLength(2);
        expect(empty.method).toBe(method);
        expect(JSON.parse(empty.body as string)).toEqual({ versions: [] });
    });

    it('should read the engine config', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {
                    data: {
                        cas_required: false, 
                        delete_version_after: '0s', 
                        max_versions: 0, 
                    }, 
                },
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        const response = await api.getConfig('secret');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('secret/config');
        expect(req.body).toBeUndefined();
        expect(response.data.max_versions).toBe(0);
    });

    it('should write the engine config', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        await api.setConfig('secret', {
            max_versions: 5,
            cas_required: false,
            delete_version_after: '3h25m19s',
        });

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('secret/config');
        expect(JSON.parse(req.body as string)).toEqual({
            max_versions: 5,
            cas_required: false,
            delete_version_after: '3h25m19s',
        });
    });

    it('should read secret metadata', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { data: { current_version: 3, versions: {} } },
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        const response = await api.getMetadata('secret', 'a/b');

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('secret/metadata/a/b');
        expect(req.body).toBeUndefined();
        expect(response.data.current_version).toBe(3);
    });

    it('should write secret metadata', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        await api.saveMetadata('secret', 'a/b', {
            max_versions: 5,
            custom_metadata: { foo: 'abc' },
        });

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('secret/metadata/a/b');
        expect(JSON.parse(req.body as string)).toEqual({
            max_versions: 5,
            custom_metadata: { foo: 'abc' },
        });
    });

    it('should read secret subkeys', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { data: { subkeys: { foo: null }, metadata: { version: 1 } } },
            }),
        });

        const api = new KeyValueV2API({ client: createClient({ transport }) });

        const response = await api.getSubkeys('m', 'p');

        let req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('m/subkeys/p');
        expect(response.data.subkeys).toEqual({ foo: null });

        await api.getSubkeys('m', 'p', { version: 2, depth: 1 });

        req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('m/subkeys/p?version=2&depth=1');
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
            { data: { bar: 'baz' } },
        );

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('POST');
        expect(req.url).toBe('secrets/data/key');
        expect(JSON.parse(req.body as string)).toEqual({ data: { bar: 'baz' } });
    });
});
