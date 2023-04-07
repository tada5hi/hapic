/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { ProjectArtifactLabelAPI } from '../../../src';

describe('src/domains/project-artifact-label', () => {
    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectArtifactLabelAPI({ driver });
        await api.delete({
            labelId: 1,
            projectName: 'foo',
            repositoryName: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar/artifacts/latest/labels/1',
        );
    });

    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.post = fn;

        const api = new ProjectArtifactLabelAPI({ driver });
        const payload = {
            labelId: 1,
            repositoryName: 'bar',
            projectName: 'foo',
        };

        await api.create(payload);

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar/artifacts/latest/labels',
            {
                id: payload.labelId,
            },
        );
    });
});
