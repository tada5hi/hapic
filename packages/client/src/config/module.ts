/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Config } from './type';

const configMap: Record<string, Config> = {};

export function setConfig(
    value?: Config,
    key?: string,
) : Config {
    key = key || 'default';
    value = buildConfig(value);

    configMap[key] = value;

    return value;
}

export function useConfig(
    key?: string,
): Config {
    key = key || 'default';

    if (typeof configMap[key] === 'undefined') {
        return buildConfig();
    }

    return configMap[key];
}

export function buildConfig(
    config?: Config,
) : Config {
    config = config || {};
    config.extra = config.extra || {};

    return config;
}
