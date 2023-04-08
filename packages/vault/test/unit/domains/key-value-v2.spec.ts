/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import { KeyValueV2API } from '../../../src';

describe('src/domains/key-value/v2', () => {
    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new KeyValueV2API({ driver });
        await api.create({
            engine: 'secrets',
            path: 'key',
            data: {
                data: {
                    bar: 'baz',
                },
            },
        });

        expect(fn).toHaveBeenCalledWith('secrets/data/key', { data: { bar: 'baz' } });
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new KeyValueV2API({ driver });
        await api.getOne({ engine: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/data/bar');
    });

    it('should update resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.patch = fn;

        const api = new KeyValueV2API({ driver });
        await api.update({
            engine: 'secrets',
            path: 'key',
            data: {
                data: {
                    boz: 'buz',
                },
            },
        });

        expect(fn).toHaveBeenCalledWith('secrets/data/key', { data: { boz: 'buz' } });
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new KeyValueV2API({ driver });
        await api.delete({ engine: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/metadata/bar');
    });

    it('should save resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new KeyValueV2API({ driver });
        await api.save({
            engine: 'secrets',
            path: 'key',
            data: {
                data: {
                    bar: 'baz',
                },
            },
        });

        expect(fn).toHaveBeenCalledWith('secrets/data/key', { data: { bar: 'baz' } });
    });
});