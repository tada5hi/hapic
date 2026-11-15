/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { ProjectRepositoryArtifactLabelAPI } from '../../../src';

describe('src/domains/project-artifact-label', () => {
    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactLabelAPI({ client: createClient({ transport }) });

        await api.delete({
            labelId: 1,
            projectName: 'foo',
            repositoryName: 'bar',
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/foo/repositories/bar/artifacts/latest/labels/1');
    });

    it('should create resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactLabelAPI({ client: createClient({ transport }) });

        await api.create({
            labelId: 1,
            repositoryName: 'bar',
            projectName: 'foo',
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects/foo/repositories/bar/artifacts/latest/labels');
        expect(JSON.parse(request.body as string)).toEqual({ id: 1 });
    });

    it('should encode path segments', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectRepositoryArtifactLabelAPI({ client: createClient({ transport }) });

        await api.create({
            labelId: 1,
            projectName: 'foo',
            repositoryName: 'a/b',
            tagOrDigest: 'sha256:abc',
        });
        await api.delete({
            labelId: 1,
            projectName: 'foo',
            repositoryName: 'a/b',
            tagOrDigest: 'sha256:abc',
        });

        expect(transport.requests.map((r) => `${r.method} ${r.url}`)).toEqual([
            'POST projects/foo/repositories/a%252Fb/artifacts/sha256%3Aabc/labels',
            'DELETE projects/foo/repositories/a%252Fb/artifacts/sha256%3Aabc/labels/1',
        ]);
    });
});
