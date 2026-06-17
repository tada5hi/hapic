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

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('DELETE');
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

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('POST');
        expect(request.url).toBe('projects/foo/repositories/bar/artifacts/latest/labels');
        expect(JSON.parse(request.init.body as string)).toEqual({ id: 1 });
    });
});
