/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildConfig, hasConfig, setConfig } from '../../../src';

describe('src/config/instance', () => {
    it('should create instance', () => {
        expect(hasConfig()).toBeFalsy();

        setConfig(buildConfig());

        expect(hasConfig()).toBeTruthy();
    });
});
