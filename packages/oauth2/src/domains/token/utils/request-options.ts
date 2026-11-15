/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IClient,
    RequestBaseOptions,
    RequestTransformer,
} from 'hapic';
import { HeaderName } from 'hapic';
import type { Options } from '../../../config';
import type { ClientAuthenticationParameters, TokenBaseOptions } from '../types';
import { createRequestTransformerForTokenAPIRequest } from './request-transformation';

/*
 * Request building shared by the token and the device authorization API.
 */

/**
 * Fill client_id, client_secret and realm_id from the client options when the
 * parameters carry no client_id. A client_secret without a client_id is dropped.
 * Mutates and returns the parameters.
 */
export function extendClientAuthenticationParameters<T extends ClientAuthenticationParameters>(
    parameters: T,
    defaults: Options,
) : T {
    if (!parameters.client_id) {
        if (parameters.client_secret) {
            delete parameters.client_secret;
        }

        if (defaults.clientId) {
            parameters.client_id = defaults.clientId;
        }

        if (defaults.clientSecret) {
            parameters.client_secret = defaults.clientSecret;
        }
    }

    if (!parameters.realm_id && defaults.realmId) {
        parameters.realm_id = defaults.realmId;
    }

    return parameters;
}

/**
 * Build the transformers of an authorization server request: the token API
 * header rules first, then the client's default transformers. Fills clientId,
 * clientSecret and realmId of the options (mutated) from the client options.
 */
export function buildRequestTransformersForTokenAPIRequest(
    client: IClient,
    defaults: Options,
    parameters: ClientAuthenticationParameters,
    options: TokenBaseOptions = {},
) : RequestTransformer[] {
    const transformers : RequestTransformer[] = [];

    if (!options.clientId) {
        if (defaults.clientId) {
            options.clientId = defaults.clientId;
        }

        if (defaults.clientSecret) {
            options.clientSecret = defaults.clientSecret;
        }
    }

    if (!options.realmId && defaults.realmId) {
        options.realmId = defaults.realmId;
    }

    transformers.push(createRequestTransformerForTokenAPIRequest(parameters, options));

    if (client.defaults.transform) {
        if (Array.isArray(client.defaults.transform)) {
            transformers.push(...client.defaults.transform);
        } else {
            transformers.push(client.defaults.transform);
        }
    }

    return transformers;
}

/**
 * Build the request options of an authorization server request: the
 * transformers, `Accept: application/json`, and the signal and timeout of the options.
 */
export function buildRequestOptionsForTokenAPIRequest(
    transform: RequestTransformer[],
    options: TokenBaseOptions = {},
) : RequestBaseOptions {
    const requestOptions : RequestBaseOptions = {
        transform,
        headers: { [HeaderName.ACCEPT]: 'application/json' },
    };

    if (options.signal) {
        requestOptions.signal = options.signal;
    }

    if (typeof options.timeout !== 'undefined') {
        requestOptions.timeout = options.timeout;
    }

    return requestOptions;
}

/**
 * Build a form body: non empty strings as is, arrays joined with spaces,
 * everything else left out.
 */
export function buildURLSearchParamsForTokenAPIRequest(
    input: Record<string, any>,
) : URLSearchParams {
    const urlSearchParams = new URLSearchParams();
    const keys = Object.keys(input);

    for (const key of keys) {
        const value = input[key];

        if (typeof value === 'string' && !!value) {
            urlSearchParams.append(key, value);
        } else if (Array.isArray(value)) {
            const str = value.filter((el) => el).join(' ');

            if (str) {
                urlSearchParams.append(key, str);
            }
        }
    }

    return urlSearchParams;
}
