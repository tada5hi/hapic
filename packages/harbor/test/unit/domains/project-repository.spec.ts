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
        expect(request.url).toBe('projects/foo/repositories?q=name%3Dfoo%252Fbar&page_size=1');
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

    it('should encode the repository name twice in the path', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { name: 'foo/a/b' },
            }),
        });
        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });

        const result = await api.getOne('foo/a/b');

        expect(result.name_short).toBe('a/b');

        await api.update({
            projectName: 'foo',
            repositoryName: 'a/b',
            data: { description: 'x' },
        });
        await api.delete('foo/a/b');

        expect(transport.requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'GET projects/foo/repositories/a%252Fb',
            'PUT projects/foo/repositories/a%252Fb',
            'DELETE projects/foo/repositories/a%252Fb',
        ]);
    });

    it('should find resource by exact name', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [{ name: 'foo/a/b' }],
            }),
        });
        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });

        const result = await api.findOne('foo/a/b');

        expect(result?.name).toBe('foo/a/b');
        // q decodes (twice) to `name=foo/a/b`: exact match, not `~` substring
        expect(transport.requests.at(-1)!.url).toBe('projects/foo/repositories?q=name%3Dfoo%252Fa%252Fb&page_size=1');
    });

    it('should get all pages without mutating the query', async () => {
        const transport = new MemoryTransport({
            fetch: (request) => ({
                status: 200,
                headers: { 'content-type': 'application/json', 'x-total-count': '3' },
                body: request.url.endsWith('page=3') ?
                    [{ name: 'proj/c' }] :
                    [{ name: 'proj/a' }, { name: 'proj/b' }],
            }),
        });
        const api = new ProjectRepositoryAPI({ client: createClient({ transport }) });
        const query = { page_size: 2 };
        const context = { projectName: 'proj', query };

        const result = await api.getAll(context);

        expect(result.data.map((item) => item.name_short)).toEqual(['a', 'b', 'a', 'b', 'c']);
        expect(result.meta.total).toBe(3);
        expect(query).toEqual({ page_size: 2 });
        expect(context.query).toBe(query);
        expect(transport.requests.map((r) => r.url)).toEqual([
            'projects/proj/repositories?page_size=2&page=1',
            'projects/proj/repositories?page_size=2&page=2',
            'projects/proj/repositories?page_size=2&page=3',
        ]);
    });
});
