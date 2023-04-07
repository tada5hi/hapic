/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { MountAPI } from '../../../src';

describe('src/domains/key-value/v1', () => {
    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new MountAPI({ driver });
        await api.create({
            path: 'key',
            data: {
                type: 'kv',
            },
        });

        expect(fn).toHaveBeenCalledWith('sys/mounts/key', {
            type: 'kv',
            config: {},
            options: {},
        });
    });

    it('should get resources', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new MountAPI({ driver });
        await api.getMany();

        expect(fn).toHaveBeenCalledWith('sys/mounts');
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new MountAPI({ driver });
        await api.getOne('foo');

        expect(fn).toHaveBeenCalledWith('sys/mounts/foo');
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new MountAPI({ driver });
        await api.delete('foo');

        expect(fn).toHaveBeenCalledWith('sys/mounts/foo');
    });
});
