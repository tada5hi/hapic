/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver, isDriver } from '../../../src';

describe('src/utils/instance', () => {
    it('should check client driver instance', () => {
        let input : any;
        expect(isDriver(input)).toBeFalsy();

        input = () => 1;
        expect(isDriver(input)).toBeFalsy();

        input = createDriver();
        expect(input).toBeTruthy();
    });

    it('should create client driver instance', () => {
        const instance = createDriver({
            baseURL: 'http://localhost:3000',
        });
        expect(isDriver(instance)).toBeTruthy();
        expect(instance.defaults.baseURL).toEqual('http://localhost:3000');

        const instanceTwo = createDriver(instance);
        expect(isDriver(instanceTwo)).toBeTruthy();
        expect(instance).toEqual(instanceTwo);
    });
});
