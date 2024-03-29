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
import { OAuth2Client } from './module';

const instanceMap: Record<string, OAuth2Client> = {};

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
    client: OAuth2Client,
    key?: string,
) : OAuth2Client {
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
) : OAuth2Client {
    key = key || 'default';

    if (Object.prototype.hasOwnProperty.call(instanceMap, key)) {
        return instanceMap[key];
    }

    const instance = createClient();

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
    return new OAuth2Client(input);
}

/**
 * Check if the argument is of instance Client.
 *
 * @param input
 */
export function isClient(input: unknown): input is OAuth2Client {
    if (input instanceof OAuth2Client) {
        return true;
    }

    return verifyInstanceBySymbol(input, 'OAuth2Client');
}
