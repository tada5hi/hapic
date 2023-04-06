/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { Options } from '../type';
import type { OpenIDProviderMetadata } from './type';

export function parseOpenIDProviderMetadata(
    data: OpenIDProviderMetadata,
) : Options {
    const options: Options = {};

    if (data.authorization_endpoint) {
        options.authorizationEndpoint = data.authorization_endpoint;
    }

    if (data.introspection_endpoint) {
        options.introspectionEndpoint = data.introspection_endpoint;
    }

    if (data.token_endpoint) {
        options.tokenEndpoint = data.token_endpoint;
    }

    if (data.userinfo_endpoint) {
        options.userinfoEndpoint = data.userinfo_endpoint;
    }

    return options;
}
