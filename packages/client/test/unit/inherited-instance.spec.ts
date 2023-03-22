/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    setClient,
    unsetClient,
    unsetConfig,
    useClient,
} from '../../src';
import { TestTrapiClient } from '../data/child-class';

describe('src/**/*.ts', () => {
    it('should create instance with inherited class', () => {
        setClient(new TestTrapiClient());

        const instance = useClient<TestTrapiClient>();

        expect(instance).toBeInstanceOf(TestTrapiClient);
        expect(instance.test()).toEqual(true);

        unsetConfig();
        unsetClient();
    });
});
