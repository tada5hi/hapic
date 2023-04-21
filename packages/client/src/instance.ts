/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from './request';
import { Client } from './module';
import { hasOwnProperty, verifyInstanceBySymbol } from './utils';

const instanceMap: Record<string, Client> = {};

export function hasClient(
    key?: string,
) : boolean {
    return hasOwnProperty(instanceMap, key || 'default');
}

export function setClient<T extends Client = Client>(
    client: T,
    key?: string,
) : T {
    key = key || 'default';

    instanceMap[key] = client;

    return client;
}

export function useClient<T extends Client = Client>(key?: string) : T {
    key = key || 'default';

    if (Object.prototype.hasOwnProperty.call(instanceMap, key)) {
        return instanceMap[key] as T;
    }

    const instance = createClient();

    instanceMap[key] = instance;

    return instance as T;
}

export function unsetClient(key?: string) {
    key = key || 'default';
    if (hasOwnProperty(instanceMap, key)) {
        delete instanceMap[key];
    }
}

export function createClient(input?: RequestBaseOptions) {
    return new Client(input);
}

export function isClient(input: unknown): input is Client {
    if (input instanceof Client) {
        return true;
    }

    return verifyInstanceBySymbol(input, 'Client');
}
