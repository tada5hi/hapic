/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty } from '../utils';
import type { Config, ConfigInput } from './type';
import { buildConfig } from './utils';

const instanceMap: Record<string, Config> = {};

export function hasConfig(
    key?: string,
) : boolean {
    return hasOwnProperty(instanceMap, key || 'default');
}

export function setConfig(
    value?: ConfigInput,
    key?: string,
) : ConfigInput {
    key = key || 'default';

    instanceMap[key] = buildConfig(value);

    return instanceMap[key];
}

export function useConfig(
    key?: string,
): ConfigInput {
    key = key || 'default';

    if (typeof instanceMap[key] === 'undefined') {
        return buildConfig();
    }

    return instanceMap[key];
}

export function unsetConfig(key?: string) {
    key = key || 'default';
    if (hasOwnProperty(instanceMap, key)) {
        delete instanceMap[key];
    }
}
