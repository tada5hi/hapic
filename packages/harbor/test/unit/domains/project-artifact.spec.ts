/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { ProjectArtifactAPI } from '../../../src';

describe('src/domains/project-artifact', () => {
    it('should delete resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectArtifactAPI({ client: driver });
        await api.delete({
            projectName: 'foo',
            repositoryName: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar/artifacts/latest',
        );

        await api.delete({
            projectName: 'foo',
            repositoryName: 'bar',
            tagOrDigest: 'base',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar/artifacts/base',
        );
    });

    it('should copy resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.post = fn;

        const api = new ProjectArtifactAPI({ client: driver });
        await api.copy({
            repositoryName: 'bar',
            projectName: 'foo',
        }, {
            repositoryName: 'biz',
            projectName: 'baz',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar/artifacts?from=baz/biz:latest',
        );
    });

    it('should get resources', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectArtifactAPI({ client: driver });
        await api.getMany({
            repositoryName: 'repo',
            projectName: 'proj',
            query: {
                page_size: 10,
                with_label: true,
                with_tag: true,
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/proj/repositories/repo/artifacts?page_size=10&with_label=true&with_tag=true',
        );
    });
});
