/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildAuthorizeURL } from './helper';
import type { AuthorizeParameters } from './types';
import { BaseAPI } from '../base';

export class AuthorizeAPI extends BaseAPI {
    /**
     * Build authorize url based on
     * input parameters.
     *
     * @param parameters
     */
    buildURL(parameters: Partial<AuthorizeParameters> = {}) : string {
        let baseURL : string;

        if (this.options.authorizationEndpoint) {
            baseURL = this.options.authorizationEndpoint;
        } else {
            const clientURL = this.client.defaults.baseURL;

            baseURL = new URL('authorize', clientURL).href;
        }

        return buildAuthorizeURL(baseURL, {
            ...parameters,
            redirect_uri: parameters.redirect_uri || this.options.redirectUri,
            client_id: parameters.client_id || this.options.clientId,
            scope: parameters.scope || this.options.scope,
            response_type: parameters.response_type || 'code',
        });
    }
}
