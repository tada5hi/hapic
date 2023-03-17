/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from '../config';
import {
    useConfig,
} from '../config';
import { Client } from '../module';

const instanceMap: Record<string, Client> = {};

export function setClient<T extends Client = Client>(
    client: T,
    key?: string,
) : T {
    key = key || 'default';

    instanceMap[key] = client;

    return client;
}

export function useClient<T extends Client = Client>(
    key?: string,
) : T {
    key = key || 'default';

    if (Object.prototype.hasOwnProperty.call(instanceMap, key)) {
        return instanceMap[key] as T;
    }

    const config = useConfig(key);
    const instance = createClient(config);

    instanceMap[key] = instance;

    return instance as T;
}

export function createClient(input?: ConfigInput) {
    return new Client(input);
}
