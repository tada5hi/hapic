/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientDriverInstance, isClientDriverInstance } from '../../../src';

describe('src/utils/instance', () => {
    it('should check client driver instance', () => {
        let input : any;
        expect(isClientDriverInstance(input)).toBeFalsy();

        input = () => 1;
        expect(isClientDriverInstance(input)).toBeFalsy();

        input = createClientDriverInstance();
        expect(input).toBeTruthy();
    });

    fit('should create client driver instance', () => {
        const instance = createClientDriverInstance({
            baseURL: 'http://localhost:3000',
        });
        expect(isClientDriverInstance(instance)).toBeTruthy();
        expect(instance.defaults.baseURL).toEqual('http://localhost:3000');

        const instanceTwo = createClientDriverInstance(instance);
        expect(isClientDriverInstance(instanceTwo)).toBeTruthy();
        expect(instance).toEqual(instanceTwo);
    });
});
