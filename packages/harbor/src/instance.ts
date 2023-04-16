/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    hasOwnProperty,
    verifyInstanceBySymbol,
} from 'hapic';
import type { ConfigInput } from './config';
import { HarborClient } from './module';

const instances: Record<string, HarborClient> = {};

/**
 * Verify if a harbor client singleton instance exists.
 *
 * @param key
 */
export function hasHarborClient(
    key?: string,
) : boolean {
    return hasOwnProperty(instances, key || 'default');
}

/**
 * Set the harbor client singleton instance.
 *
 * @param client
 * @param key
 */
export function setHarborClient(
    client: HarborClient,
    key?: string,
) : HarborClient {
    key = key || 'default';

    instances[key] = client;

    return client;
}

/**
 * Receive a harbor singleton instance.
 *
 * @param key
 */
export function useHarborClient(
    key?: string,
) : HarborClient {
    key = key || 'default';

    if (Object.prototype.hasOwnProperty.call(instances, key)) {
        return instances[key];
    }

    const instance = createHarborClient();

    instances[key] = instance;

    return instance;
}

/**
 * Unset a harbor client singleton instance.
 *
 * @param key
 */
export function unsetHarborClient(key?: string) {
    key = key || 'default';
    if (hasOwnProperty(instances, key)) {
        delete instances[key];
    }
}

/**
 * Create a harbor client.
 *
 * @param input
 */
export function createHarborClient(input?: ConfigInput) {
    return new HarborClient(input);
}

/**
 * Check if the argument is of instance Client.
 *
 * @param input
 */
export function isHarborClient(input: unknown): input is HarborClient {
    if (input instanceof HarborClient) {
        return true;
    }

    return verifyInstanceBySymbol(input, 'HarborClient');
}
