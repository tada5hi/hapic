/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { ProjectRepositoryArtifactAPI } from '../../../src';

describe('src/domains/project-artifact', () => {
    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.delete({ projectName: 'foo', repositoryName: 'bar' });

        expect(transport.requests[0].init.method).toBe('DELETE');
        expect(transport.requests[0].url).toBe('projects/foo/repositories/bar/artifacts/latest');

        await api.delete({ projectName: 'foo', repositoryName: 'bar', tagOrDigest: 'base' });

        expect(transport.requests[1].init.method).toBe('DELETE');
        expect(transport.requests[1].url).toBe('projects/foo/repositories/bar/artifacts/base');
    });

    it('should copy resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactAPI({ client: createClient({ transport }) });

        await api.copy({
            repositoryName: 'bar',
            projectName: 'foo',
        }, {
            repositoryName: 'biz',
            projectName: 'baz',
        });

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('POST');
        expect(request.url).toBe('projects/foo/repositories/bar/artifacts?from=baz/biz:latest');
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: [],
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

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('GET');
        expect(request.url).toBe('projects/proj/repositories/repo/artifacts?page_size=10&with_label=true&with_tag=true');
    });
});
