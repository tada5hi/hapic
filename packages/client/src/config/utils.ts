/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isDriver } from '../utils';
import type { Config, ConfigInput } from './type';

export function buildConfig(
    options?: ConfigInput,
) : Config {
    options = options || {};

    if (options.driver) {
        if (isDriver(options.driver)) {
            if (typeof options.driver.defaults.withCredentials === 'undefined') {
                options.driver.defaults.withCredentials = true;
            }
        } else if (typeof options.driver.withCredentials === 'undefined') {
            options.driver.withCredentials = true;
        }
    }

    return {
        ...options,
        retry: options.retry ?? false,
    };
}
