/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { KeyValueV1API } from '../../../src';

describe('src/domains/key-value/v1', () => {
    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new KeyValueV1API({ driver });
        await api.create({
            mount: 'secrets',
            path: 'key',
            data: {
                bar: 'baz',
            },
        });

        expect(fn).toHaveBeenCalledWith('secrets/key', { bar: 'baz' });
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new KeyValueV1API({ driver });
        await api.getOne({ mount: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/bar');
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new KeyValueV1API({ driver });
        await api.delete({ mount: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/bar');
    });
});
