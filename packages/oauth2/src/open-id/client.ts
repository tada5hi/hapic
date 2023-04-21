/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as BaseClient, RequestBaseOptions } from 'hapic';
import { createClient, isClient } from 'hapic';
import { OAuth2Client } from '../module';
import { parseOpenIDProviderMetadata } from './provider-metadata';
import type { OpenIDProviderMetadata } from './type';

/**
 * Create a client instance by requesting details of
 * the open-id discovery endpoint.
 *
 * @param url (.e.g. .well-known/openid-configuration)
 * @param options
 */
export async function createClientWithOpenIDDiscoveryURL(
    url: string,
    options?: BaseClient | RequestBaseOptions,
) : Promise<OAuth2Client> {
    let client: BaseClient;

    if (isClient(options)) {
        client = options;
    } else {
        client = createClient(options);
    }

    const { data }: { data: OpenIDProviderMetadata } = await client.get(url);

    return new OAuth2Client({
        request: client.defaults,
        options: parseOpenIDProviderMetadata(data),
    });
}
