/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ProjectRepositoryAPI,
    createClient,
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
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectRepositoryAPI({ client: driver });
        await api.getMany({
            projectName: 'proj',
            query: {
                page_size: 10,
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/proj/repositories?page_size=10',
        );
    });

    it('should get resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: { name: 'foo/bar' } });
        driver.get = fn;

        const api = new ProjectRepositoryAPI({ client: driver });
        await api.getOne({
            projectName: 'foo',
            repositoryName: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar',
        );
    });

    it('should find resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectRepositoryAPI({ client: driver });
        await api.findOne({
            projectName: 'foo',
            repositoryName: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories?q=name%3D%257Ebar&page_size=1',
        );
    });

    it('should update resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.put = fn;

        const api = new ProjectRepositoryAPI({ client: driver });
        await api.update({
            projectName: 'foo',
            repositoryName: 'bar',
            data: {
                name: 'baz',
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar',
            {
                name: 'baz',
            },
        );
    });

    it('should delete resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectRepositoryAPI({ client: driver });
        await api.delete({
            projectName: 'foo',
            repositoryName: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/repositories/bar',
        );
    });
});
