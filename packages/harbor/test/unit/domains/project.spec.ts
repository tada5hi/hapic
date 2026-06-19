/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { HeaderName, ProjectAPI } from '../../../src';
import type { ProjectCreatePayload } from '../../../src';

describe('src/domains/project', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 201,
                headers: { location: '/projects/42' },
            }),
        });

        const api = new ProjectAPI({ client: createClient({ transport }) });
        const payload = { project_name: 'project-x', public: true };
        const result = await api.create(payload);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects');
        expect(JSON.parse(request.body as string)).toEqual(payload);

        // the Location header is now parsed by the real lifecycle
        expect(result.id).toBe(42);
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectAPI({ client: createClient({ transport }) });
        await api.delete(1);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/1');
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBeNull();
    });

    it('should delete resource by name', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectAPI({ client: createClient({ transport }) });
        await api.delete('name', true);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/name');
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBe('true');
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectAPI({ client: createClient({ transport }) });
        const payload : ProjectCreatePayload = { project_name: 'name' };
        await api.update(1, payload);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('PUT');
        expect(request.url).toBe('projects/1');
        expect(JSON.parse(request.body as string)).toEqual(payload);
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBeNull();
    });

    it('should update resource by name', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectAPI({ client: createClient({ transport }) });
        const payload : ProjectCreatePayload = { project_name: 'name' };
        await api.update('name', payload, true);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('PUT');
        expect(request.url).toBe('projects/name');
        expect(JSON.parse(request.body as string)).toEqual(payload);
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBe('true');
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectAPI({ client: createClient({ transport }) });
        const { data } = await api.getMany({ query: { page_size: 10, with_detail: true } });

        expect(data).toEqual([]);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects?page_size=10&with_detail=true');
    });

    it('should get all resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectAPI({ client: createClient({ transport }) });
        await api.getAll({ query: { with_detail: true } });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects?with_detail=true&page_size=50&page=1');
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new ProjectAPI({ client: createClient({ transport }) });
        await api.getOne(1);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/1');
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBeNull();
    });

    it('should get resource by name', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new ProjectAPI({ client: createClient({ transport }) });
        await api.getOne('name', true);

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/name');
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBe('true');
    });
});
