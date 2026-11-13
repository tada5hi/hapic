/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { HeaderName, ProjectRepositoryArtifactAPI } from '../../../src';

function jsonResponse(body: unknown, headers: Record<string, string> = {}) {
    return {
        status: 200,
        headers: { 'content-type': 'application/json', ...headers },
        body,
    };
}

describe('src/domains/project-artifact', () => {
    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.delete({ projectName: 'foo', repositoryName: 'bar' });

        expect(transport.requests[0].method).toBe('DELETE');
        expect(transport.requests[0].url).toBe('projects/foo/repositories/bar/artifacts/latest');

        await api.delete({
            projectName: 'foo',
            repositoryName: 'bar',
            tagOrDigest: 'base',
        });

        expect(transport.requests[1].method).toBe('DELETE');
        expect(transport.requests[1].url).toBe('projects/foo/repositories/bar/artifacts/base');
    });

    it('should copy resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        const source = {
            repositoryName: 'biz',
            projectName: 'baz',
        };

        await api.copy({
            repositoryName: 'bar',
            projectName: 'foo',
        }, source);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects/foo/repositories/bar/artifacts?from=baz%2Fbiz%3Alatest');
        expect(source).toEqual({ repositoryName: 'biz', projectName: 'baz' });
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.getMany({
            repositoryName: 'repo',
            projectName: 'proj',
            query: {
                page_size: 10,
                with_label: true,
                with_tag: true,
            },
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/proj/repositories/repo/artifacts?page_size=10&with_label=true&with_tag=true');
    });

    it('should encode repository name twice and reference once', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.getMany({
            projectName: 'foo',
            repositoryName: 'a/b',
            query: { q: { tags: 'v1' } },
        });
        await api.copy({ projectName: 'foo', repositoryName: 'a/b' }, 'baz/biz:latest');
        await api.delete({
            projectName: 'foo',
            repositoryName: 'a/b',
            tagOrDigest: 'sha256:abc',
        });

        expect(transport.requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'GET projects/foo/repositories/a%252Fb/artifacts?q=tags%3Dv1',
            'POST projects/foo/repositories/a%252Fb/artifacts?from=baz%2Fbiz%3Alatest',
            'DELETE projects/foo/repositories/a%252Fb/artifacts/sha256%3Aabc',
        ]);
    });

    it('should return the collection meta of artifacts', async () => {
        const transport = new MemoryTransport({ fetch: () => jsonResponse([{ digest: 'sha256:a' }], { 'x-total-count': '3' }) });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        const response = await api.getMany({
            projectName: 'proj',
            repositoryName: 'repo',
            query: { page_size: 1 },
        });

        expect(response).toEqual({ data: [{ digest: 'sha256:a' }], meta: { total: 3 } });
        expect(transport.requests.at(-1)!.url).toBe('projects/proj/repositories/repo/artifacts?page_size=1');
    });

    it('should send the accepted vulnerability report types', async () => {
        const transport = new MemoryTransport({ fetch: () => jsonResponse([]) });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.getMany({
            projectName: 'proj',
            repositoryName: 'repo',
            acceptVulnerabilities: 'a, b',
        });
        await api.getMany({ projectName: 'proj', repositoryName: 'repo' });

        const [withHeader, withoutHeader] = transport.requests;

        expect((withHeader.headers as Headers).get(HeaderName.ACCEPT_VULNERABILITIES)).toBe('a, b');
        expect((withoutHeader.headers as Headers).get(HeaderName.ACCEPT_VULNERABILITIES)).toBeNull();
    });

    it('should get all pages of artifacts without mutating the query', async () => {
        const pages : Record<string, unknown[]> = {
            1: [{ digest: 'a' }, { digest: 'b' }],
            2: [{ digest: 'c' }, { digest: 'd' }],
            3: [],
        };
        const transport = new MemoryTransport({
            fetch: (request) => {
                const page = new URL(request.url, 'http://localhost').searchParams.get('page')!;

                return jsonResponse(pages[page], { 'x-total-count': '4' });
            },
        });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });
        const query = { page_size: 2, with_tag: true };

        const { data, meta } = await api.getAll({
            projectName: 'proj',
            repositoryName: 'repo',
            query,
        });

        expect(data.map((item) => item.digest)).toEqual(['a', 'b', 'c', 'd']);
        expect(meta).toEqual({ total: 4 });
        expect(query).toEqual({ page_size: 2, with_tag: true });
        expect(transport.requests.map((r) => r.url)).toEqual([
            'projects/proj/repositories/repo/artifacts?page_size=2&with_tag=true&page=1',
            'projects/proj/repositories/repo/artifacts?page_size=2&with_tag=true&page=2',
            'projects/proj/repositories/repo/artifacts?page_size=2&with_tag=true&page=3',
        ]);
    });

    it('should get one artifact by reference', async () => {
        const transport = new MemoryTransport({ fetch: () => jsonResponse({ digest: 'sha256:abc' }) });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        const artifact = await api.getOne({
            projectName: 'p',
            repositoryName: 'a/b',
            tagOrDigest: 'sha256:abc',
            query: { with_tag: true },
            acceptVulnerabilities: 'a',
        });

        expect(artifact).toEqual({ digest: 'sha256:abc' });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/p/repositories/a%252Fb/artifacts/sha256%3Aabc?with_tag=true');
        expect((request.headers as Headers).get(HeaderName.ACCEPT_VULNERABILITIES)).toBe('a');

        await api.getOne({ projectName: 'p', repositoryName: 'r' });

        expect(transport.requests.at(-1)!.url).toBe('projects/p/repositories/r/artifacts/latest');
        expect((transport.requests.at(-1)!.headers as Headers).get(HeaderName.ACCEPT_VULNERABILITIES)).toBeNull();
    });

    it('should create a tag', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 201 }) });
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.createTag({
            projectName: 'p',
            repositoryName: 'a/b',
            tagOrDigest: 'v1',
            name: 'stable',
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects/p/repositories/a%252Fb/artifacts/v1/tags');
        expect(JSON.parse(request.body as string)).toEqual({ name: 'stable' });

        await api.createTag({
            projectName: 'p', 
            repositoryName: 'r', 
            name: 'stable', 
        });

        expect(transport.requests.at(-1)!.url).toBe('projects/p/repositories/r/artifacts/latest/tags');
    });

    it('should delete a tag', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.deleteTag({
            projectName: 'p',
            repositoryName: 'a/b',
            tagOrDigest: 'v1',
            name: 'v1+build',
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/p/repositories/a%252Fb/artifacts/v1/tags/v1%2Bbuild');
        expect(request.body).toBeUndefined();
    });
});
