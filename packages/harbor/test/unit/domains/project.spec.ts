/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { HeaderName, ProjectAPI } from '../../../src';
import type { Project, ProjectCreatePayload } from '../../../src';

describe('src/domains/project', () => {
    it('should create resource', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockImplementation((_url, data) => ({ data: { ...data } satisfies Project }));
        client.post = fn;

        const api = new ProjectAPI({ client });
        const payload = {
            project_name: 'project-x',
            public: true,
        };
        await api.create(payload);

        expect(fn).toHaveBeenCalledWith('projects', payload);
    });

    it('should delete resource', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        client.delete = fn;

        const api = new ProjectAPI({ client });
        await api.delete(1);

        expect(fn).toHaveBeenCalledWith('projects/1', {});
    });

    it('should delete resource by name', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        client.delete = fn;

        const api = new ProjectAPI({ client });
        await api.delete('name', true);

        expect(fn).toHaveBeenCalledWith('projects/name', {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });

    it('should update resource', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        client.put = fn;

        const api = new ProjectAPI({ client });
        const payload : ProjectCreatePayload = {
            project_name: 'name',
        };
        await api.update(1, payload);

        expect(fn).toHaveBeenCalledWith('projects/1', payload, {});
    });

    it('should update resource by name', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        client.put = fn;

        const api = new ProjectAPI({ client });
        const payload : ProjectCreatePayload = {
            project_name: 'name',
        };
        await api.update('name', payload, true);

        expect(fn).toHaveBeenCalledWith('projects/name', payload, {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });

    it('should get resources', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        client.get = fn;

        const api = new ProjectAPI({ client });
        await api.getMany({
            query: {
                page_size: 10,
                with_detail: true,
            },
        });

        expect(fn).toHaveBeenCalledWith('projects?page_size=10&with_detail=true');
    });

    it('should get all resources', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        client.get = fn;

        const api = new ProjectAPI({ client });
        await api.getAll({
            query: {
                with_detail: true,
            },
        });

        expect(fn).toHaveBeenCalledWith('projects?with_detail=true&page_size=50&page=1');
    });

    it('should get resource', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        client.get = fn;

        const api = new ProjectAPI({ client });
        await api.getOne(1);

        expect(fn).toHaveBeenCalledWith('projects/1', {});
    });

    it('should get resource by name', async () => {
        const client = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        client.get = fn;

        const api = new ProjectAPI({ client });
        await api.getOne('name', true);

        expect(fn).toHaveBeenCalledWith('projects/name', {
            [HeaderName.IS_RESOURCE_NAME]: true,
        });
    });
});
