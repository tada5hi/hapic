/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Config, ConfigInput } from './type';

const configMap: Record<string, Config> = {};

export function setConfig(
    value?: ConfigInput,
    key?: string,
) : ConfigInput {
    key = key || 'default';

    configMap[key] = buildConfig(value);

    return configMap[key];
}

export function useConfig(
    key?: string,
): ConfigInput {
    key = key || 'default';

    if (typeof configMap[key] === 'undefined') {
        return buildConfig();
    }

    return configMap[key];
}

export function buildConfig(
    config?: ConfigInput,
) : Config {
    config = config || {};

    return {
        ...config,
        extra: config.extra || {},
        retry: config.retry ?? false,
    };
}
