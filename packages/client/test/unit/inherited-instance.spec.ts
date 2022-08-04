/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setClient, setConfig, useClient } from '../../src';
import { TestTrapiClient } from '../data/child-class';

describe('src/**/*.ts', () => {
    it('should create instance with inherited class', () => {
        setConfig({
            clazz: TestTrapiClient,
        });

        let instance = useClient<TestTrapiClient>('default');

        setClient(instance, 'default');

        instance = useClient<TestTrapiClient>('default');

        expect(instance.test()).toEqual(true);
    });
});
