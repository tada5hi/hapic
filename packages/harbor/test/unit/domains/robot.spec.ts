/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { RobotAPI, buildRobotPermissionForAllResources } from '../../../src';
import type { Project } from '../../../src';

describe('src/domains/robot', () => {
    it('should build robot permission object for global access', () => {
        const robotPermission = buildRobotPermissionForAllResources('*');
        expect(robotPermission.namespace).toEqual('*');
        expect(robotPermission.kind).toEqual('project');
        expect(robotPermission.access.length).toBeGreaterThan(0);
    });

    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockImplementation((_url, data) => ({ data: { ...data } satisfies Project }));
        driver.post = fn;

        const api = new RobotAPI({ driver });
        await api.create({
            name: 'robi',
        });

        expect(fn).toHaveBeenCalledWith('robots', api.extendPayload({ name: 'robi' }));
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new RobotAPI({ driver });
        await api.delete(1);

        expect(fn).toHaveBeenCalledWith('robots/1');
    });

    it('should update resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.put = fn;

        const api = new RobotAPI({ driver });
        await api.update(1, {
            name: 'robus',
        });

        expect(fn).toHaveBeenCalledWith(
            'robots/1',
            api.extendPayload({ name: 'robus', id: 1 }),
        );
    });

    it('should get resources', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new RobotAPI({ driver });
        await api.getMany({
            query: {
                page_size: 10,
            },
        });

        expect(fn).toHaveBeenCalledWith('robots?page_size=10');
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new RobotAPI({ driver });
        await api.getOne(1);

        expect(fn).toHaveBeenCalledWith('robots/1');
    });
});
