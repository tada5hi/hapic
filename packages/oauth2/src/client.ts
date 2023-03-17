/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Config,
} from 'hapic';
import {
    setClient as _setClient,
    useClient as _useClient,
    buildConfig,
} from 'hapic';
import { Client } from './module';

export type {
    Config,

    ClientRequestConfig,
    ClientResponse,
    ClientInterface,
    ClientDriverInstance,
    ClientError,
    ClientRetryConfig,

    ErrorCode,

} from 'hapic';
export {
    buildConfig,
    setConfig,
    useConfig,
} from 'hapic';

export function createClient(input?: Omit<Config, 'clazz'>) : Client {
    const config = buildConfig(input);

    return new Client(config);
}

export function setClient<T extends Client = Client>(client: T, key?: string) : T {
    _setClient(client, key);

    return client;
}

export function useClient(key?: string) : Client {
    key = key || 'oauth2';

    let client = _useClient(key);
    if (client instanceof Client) {
        return client;
    }

    client = createClient();
    setClient(client as Client, key);

    return client as Client;
}
