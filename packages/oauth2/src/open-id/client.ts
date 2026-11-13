/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient } from 'hapic';
import { HeaderName, createClient, isClient } from 'hapic';
import { OAuth2Client } from '../module';
import { parseOpenIDProviderMetadata } from './provider-metadata';
import type { OpenIDProviderMetadata } from './types';

/**
 * Create a client instance by requesting details of
 * the open-id discovery endpoint.
 *
 * When client options are passed, the returned client is built from
 * them (incl. a `transport`).
 *
 * When a client is passed, the discovery request is sent with it and the
 * returned client is built from its `defaults` plus its current
 * authorization header. Its transport, other headers set or unset after
 * construction, and its hooks are **not** carried over (hooks are bound
 * to a client instance); configure them on the returned client.
 *
 * @param url (.e.g. .well-known/openid-configuration)
 * @param options
 */
export async function createClientWithOpenIDDiscoveryURL(
    url: string,
    options?: IClient | ClientOptionsInput,
) : Promise<OAuth2Client> {
    if (!isClient(options)) {
        const { data }: { data: OpenIDProviderMetadata } = await createClient(options).get(url);

        return new OAuth2Client({
            request: options,
            options: parseOpenIDProviderMetadata(data),
        });
    }

    const { data }: { data: OpenIDProviderMetadata } = await options.get(url);

    const client = new OAuth2Client({
        request: options.defaults,
        options: parseOpenIDProviderMetadata(data),
    });

    const authorization = options.getAuthorizationHeader();

    if (authorization) {
        client.setHeader(HeaderName.AUTHORIZATION, authorization);
    }

    return client;
}
