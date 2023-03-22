/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from 'hapic';
import {
    hasOwnProperty,
    useConfig,
} from 'hapic';
import { Client } from './module';

const instanceMap: Record<string, Client> = {};

/**
 * Verify if an oauth2 client singleton instance exists.
 *
 * @param key
 */
export function hasClient(
    key?: string,
) : boolean {
    return hasOwnProperty(instanceMap, key || 'default');
}

/**
 * Set the oauth2 client singleton instance.
 *
 * @param client
 * @param key
 */
export function setClient(
    client: Client,
    key?: string,
) : Client {
    key = key || 'default';

    instanceMap[key] = client;

    return client;
}

/**
 * Receive an oauth2 singleton instance.
 *
 * @param key
 */
export function useClient(
    key?: string,
) : Client {
    key = key || 'default';

    if (Object.prototype.hasOwnProperty.call(instanceMap, key)) {
        return instanceMap[key];
    }

    const config = useConfig(key);
    const instance = createClient(config);

    instanceMap[key] = instance;

    return instance;
}

/**
 * Unset an oauth2 client singleton instance.
 *
 * @param key
 */
export function unsetClient(key?: string) {
    key = key || 'default';
    if (hasOwnProperty(instanceMap, key)) {
        delete instanceMap[key];
    }
}

/**
 * Create an oauth2 client.
 *
 * @param input
 */
export function createClient(input?: ConfigInput) {
    return new Client(input);
}
