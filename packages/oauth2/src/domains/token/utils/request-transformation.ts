/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'hapic';
import type { RequestTransformer } from 'hapic';
import type { ClientAuthenticationParameters, TokenBaseOptions } from '../type';
import { transformHeadersForTokenAPIRequest } from './header-transformation';

export function createRequestTransformerForTokenAPIRequest(
    parameters: ClientAuthenticationParameters,
    options?: TokenBaseOptions,
) : RequestTransformer {
    return (data: any, headers: Headers) => {
        options = options || {};

        if (!options.clientId) {
            options.clientId = parameters.client_id;
            options.clientSecret = parameters.client_secret;
        }

        transformHeadersForTokenAPIRequest(headers, options);

        if (options.clientCredentialsAsHeader) {
            if (data instanceof URLSearchParams) {
                data.delete('client_id');
                data.delete('client_secret');

                return data;
            }

            if (isObject(data)) {
                if (typeof data.client_id !== 'undefined') {
                    delete data.client_id;
                }

                if (typeof data.client_secret !== 'undefined') {
                    delete data.client_secret;
                }
            }
        }

        return data;
    };
}
