/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { HeaderName, ProjectAPI } from '../../../src';
import type { Project, ProjectCreatePayload } from '../../../src';

describe('src/domains/project', () => {
    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockImplementation((_url, data) => ({ data: { ...data } satisfies Project }));
        driver.post = fn;

        const api = new ProjectAPI({ driver });
        const payload = {
            project_name: 'project-x',
            public: true,
        };
        await api.create(payload);

        expect(fn).toHaveBeenCalledWith('projects', payload);
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectAPI({ driver });
        await api.delete(1);

        expect(fn).toHaveBeenCalledWith('projects/1', {});
    });

    it('should delete resource by name', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectAPI({ driver });
        await api.delete('name', true);

        expect(fn).toHaveBeenCalledWith('projects/name', {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });

    it('should update resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.put = fn;

        const api = new ProjectAPI({ driver });
        const payload : ProjectCreatePayload = {
            project_name: 'name',
        };
        await api.update(1, payload);

        expect(fn).toHaveBeenCalledWith('projects/1', payload, {});
    });

    it('should update resource by name', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.put = fn;

        const api = new ProjectAPI({ driver });
        const payload : ProjectCreatePayload = {
            project_name: 'name',
        };
        await api.update('name', payload, true);

        expect(fn).toHaveBeenCalledWith('projects/name', payload, {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });

    it('should get resources', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectAPI({ driver });
        await api.getMany({
            query: {
                page_size: 10,
                with_detail: true,
            },
        });

        expect(fn).toHaveBeenCalledWith('projects?page_size=10&with_detail=true');
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new ProjectAPI({ driver });
        await api.getOne(1);

        expect(fn).toHaveBeenCalledWith('projects/1', {});
    });

    it('should get resource by name', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new ProjectAPI({ driver });
        await api.getOne('name', true);

        expect(fn).toHaveBeenCalledWith('projects/name', {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });
});
