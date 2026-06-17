/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import {
    ProjectRepositoryAPI,
    parseLongProjectRepositoryName,
} from '../../../src';

describe('src/domains/project-repository', () => {
    it('should parse project repository name', () => {
        const parsed = parseLongProjectRepositoryName('project_name/repository_prefix/repository');
        expect(parsed).toBeDefined();
        expect(parsed.repositoryName).toEqual('repository_prefix/repository');
        expect(parsed.projectName).toEqual('project_name');
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        await api.getMany({
            projectName: 'proj',
            query: { page_size: 10 },
        });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/proj/repositories?page_size=10');
    });

    it('should get all resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        await api.getAll({ projectName: 'proj' });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/proj/repositories?page_size=50&page=1');
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { name: 'foo/bar' },
            }),
        });

        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        const result = await api.getOne({ projectName: 'foo', repositoryName: 'bar' });

        expect(result.name).toBe('foo/bar');

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/foo/repositories/bar');
    });

    it('should find resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        await api.findOne({ projectName: 'foo', repositoryName: 'bar' });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/foo/repositories?q=name%3D%257Ebar&page_size=1');
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        await api.update({
            projectName: 'foo',
            repositoryName: 'bar',
            data: { name: 'baz' },
        });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('PUT');
        expect(request.url).toBe('projects/foo/repositories/bar');
        expect(JSON.parse(request.body as string)).toEqual({ name: 'baz' });
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        await api.delete({ projectName: 'foo', repositoryName: 'bar' });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/foo/repositories/bar');
    });
});
