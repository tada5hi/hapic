/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scopeToArray, scopeToString } from '../../utils';
import type { BaseAPIContext } from '../type';
import type { AuthorizeParametersInput } from './type';
import { BaseAPI } from '../base';

export class AuthorizeAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    /**
     * Build authorize url based on
     * input parameters.
     *
     * @param parameters
     */
    buildURL(parameters?: Partial<AuthorizeParametersInput>) : string {
        parameters = parameters || {};

        let baseURL : string | undefined;
        let input : string | undefined;

        if (this.options.authorizationEndpoint) {
            input = this.options.authorizationEndpoint;
        } else {
            const clientURL = this.client.defaults.baseURL;
            if (clientURL) {
                baseURL = clientURL;
            }
        }

        const url = new URL(input || 'authorize', baseURL);
        url.searchParams.set('response_type', parameters.response_type || 'code');

        if (this.options.clientId) {
            url.searchParams.set('client_id', this.options.clientId);
        }

        const redirectUri = parameters.redirect_uri || this.options.redirectUri;
        if (redirectUri) {
            url.searchParams.set('redirect_uri', redirectUri);
        }

        const scope : string[] = [];
        if (this.options.scope) {
            const input = scopeToArray(this.options.scope);

            scope.push(...input);
        }

        if (parameters.scope) {
            const input = scopeToArray(parameters.scope);

            scope.push(...input);
        }

        if (scope.length > 0) {
            url.searchParams.set('scope', scopeToString(scope));
        }

        return url.href;
    }
}
