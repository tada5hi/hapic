/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { KeyValueV2API } from '../../../src';

describe('src/domains/key-value/v2', () => {
    it('should create resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new KeyValueV2API({ client: driver });
        await api.create({
            mount: 'secrets',
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
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const api = new KeyValueV2API({ client: driver });
        await api.getOne({ mount: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/data/bar');
    });

    it('should update resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.patch = fn;

        const api = new KeyValueV2API({ client: driver });
        await api.update({
            mount: 'secrets',
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
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new KeyValueV2API({ client: driver });
        await api.delete({ mount: 'foo', path: 'bar' });

        expect(fn).toHaveBeenCalledWith('foo/metadata/bar');
    });

    it('should save resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const api = new KeyValueV2API({ client: driver });
        await api.save({
            mount: 'secrets',
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
