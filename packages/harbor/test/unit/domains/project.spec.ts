/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { HeaderName, ProjectAPI } from '../../../src';
import type { ProjectCreatePayload, ProjectMetadata, ProjectUpdatePayload } from '../../../src';

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
        const payload : ProjectUpdatePayload = {
            metadata: {
                public: 'true', 
                auto_scan: 'false', 
                severity: 'high', 
            },
            cve_allowlist: { items: [{ cve_id: 'CVE-2019-10164' }], expires_at: null },
        };

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
        const payload : ProjectUpdatePayload = { metadata: { public: 'false' } };

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

    it('should encode the project name once', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        await api.getOne('a b/c', true);

        expect(transport.requests.at(-1)!.url).toBe('projects/a%20b%2Fc');
    });

    it('should get all pages without mutating the options', async () => {
        const transport = new MemoryTransport({
            fetch: (request) => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: request.url.endsWith('page=2') ? [{ name: 'c' }] : [{ name: 'a' }, { name: 'b' }],
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });
        const options = { query: { with_detail: true, page_size: 2 } };

        const { data } = await api.getAll(options);

        expect(data.map((item) => item.name)).toEqual(['a', 'b', 'c']);
        expect(options).toEqual({ query: { with_detail: true, page_size: 2 } });
        expect(transport.requests.map((r) => r.url)).toEqual([
            'projects?with_detail=true&page_size=2&page=1',
            'projects?with_detail=true&page_size=2&page=2',
        ]);
    });

    it('should not mutate options without query', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });
        const options = {};

        await api.getAll(options);

        expect(options).toEqual({});
        expect(transport.requests.at(-1)!.url).toBe('projects?page_size=50&page=1');
    });

    it('should type project metadata as Harbor wire strings', () => {
        const metadata = {
            public: 'true',
            enable_content_trust: 'false',
            enable_content_trust_cosign: 'false',
            prevent_vul: 'true',
            severity: 'critical',
            auto_scan: 'true',
            auto_sbom_generation: 'false',
            reuse_sys_cve_allowlist: 'true',
            retention_id: '1',
            proxy_speed_kb: '-1',
            max_upstream_conn: '-1',
            proxy_cache_local_on_not_found: 'false',
        } satisfies ProjectMetadata;

        // @ts-expect-error metadata values are strings on the wire
        const invalid: ProjectMetadata = { public: true };

        // @ts-expect-error a project update does not take create fields
        const update: ProjectUpdatePayload = { project_name: 'name' };

        const create: ProjectCreatePayload = { project_name: 'name', public: true };

        expect([metadata, invalid, update, create]).toHaveLength(4);
    });

    it('should create resource with the name in the location', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 201,
                headers: { location: '/api/v2.0/projects/my-proj' },
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        const result = await api.create({ project_name: 'my-proj' }, { resourceNameInLocation: true });

        expect(result).toEqual({ name: 'my-proj' });
        expect((transport.requests.at(-1)!.headers as Headers).get(HeaderName.RESOURCE_NAME_IN_LOCATION)).toBe('true');
    });

    it('should create resource with the name in the location but without location header', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 201 }) });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        const result = await api.create({ project_name: 'my-proj' }, { resourceNameInLocation: true });

        expect(result.name).toBeUndefined();
        expect(result.id).toBeUndefined();
    });

    it('should not ask for the name in the location by default', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 201,
                headers: { location: '/api/v2.0/projects/42' },
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        const result = await api.create({ project_name: 'my-proj' });

        expect(result).toEqual({ id: 42 });
        expect((transport.requests.at(-1)!.headers as Headers).get(HeaderName.RESOURCE_NAME_IN_LOCATION)).toBeNull();
    });

    it('should check if a project exists', async () => {
        let status = 200;
        const transport = new MemoryTransport({ fetch: () => ({ status }) });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        await expect(api.exists('p x')).resolves.toBe(true);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('HEAD');
        expect(request.url).toBe('projects?project_name=p+x');

        status = 404;
        await expect(api.exists('p x')).resolves.toBe(false);

        status = 500;
        await expect(api.exists('p x')).rejects.toThrow();

        status = 401;
        await expect(api.exists('p x')).rejects.toThrow();
    });

    it('should get the project summary', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { repo_count: 2 },
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        const summary = await api.getSummary('n', true);

        expect(summary).toEqual({ repo_count: 2 });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/n/summary');
        expect((request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBe('true');

        await api.getSummary(1);

        expect(transport.requests.at(-1)!.url).toBe('projects/1/summary');
        expect((transport.requests.at(-1)!.headers as Headers).get(HeaderName.IS_RESOURCE_NAME)).toBeNull();
    });

    it('should get the project metadata', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { public: 'true' },
            }),
        });
        const api = new ProjectAPI({ client: createClient({ transport }) });

        await expect(api.getMetadata(1)).resolves.toEqual({ public: 'true' });
        await expect(api.getMetadataItem('n', 'public', true)).resolves.toEqual({ public: 'true' });

        expect(transport.requests.map((r) => [
            r.method,
            r.url,
            (r.headers as Headers).get(HeaderName.IS_RESOURCE_NAME),
        ])).toEqual([
            ['GET', 'projects/1/metadatas/', null],
            ['GET', 'projects/n/metadatas/public', 'true'],
        ]);
    });

    it('should add, update and delete project metadata', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectAPI({ client: createClient({ transport }) });

        await api.addMetadata(1, 'auto_scan', 'true');
        await api.updateMetadata('n', 'severity', 'high', true);
        await api.deleteMetadata(1, 'auto_scan');

        expect(transport.requests.map((r) => [
            r.method,
            r.url,
            r.body ? JSON.parse(r.body as string) : undefined,
            (r.headers as Headers).get(HeaderName.IS_RESOURCE_NAME),
        ])).toEqual([
            ['POST', 'projects/1/metadatas/', { auto_scan: 'true' }, null],
            ['PUT', 'projects/n/metadatas/severity', { severity: 'high' }, 'true'],
            ['DELETE', 'projects/1/metadatas/auto_scan', undefined, null],
        ]);
    });
});
