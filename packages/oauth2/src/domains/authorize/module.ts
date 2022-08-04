/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, ClientDriverInstance } from 'hapic';
import { AuthorizeQueryParameters } from './type';
import { ClientOptions } from '../../type';
import { buildHTTPQuery, removeDuplicateForwardSlashesFromURL } from '../../utils';
import { BaseOAuth2API } from '../base';

export class AuthorizeAPI extends BaseOAuth2API {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(
        client: Client | ClientDriverInstance,
        options?: ClientOptions,
    ) {
        super(client, options);
    }

    buildURL(parameters?: Partial<Pick<AuthorizeQueryParameters, 'redirect_uri' | 'scope'>>) {
        parameters = parameters ?? {};

        const queryParameters: AuthorizeQueryParameters = {
            response_type: 'code',
            ...(this.options.clientId ? { client_id: this.options.clientId } : {}),
            redirect_uri: this.options.redirectUri,
        };

        if (typeof parameters.redirect_uri === 'string') {
            queryParameters.redirect_uri = parameters.redirect_uri;
        }

        if (typeof parameters.scope === 'undefined') {
            if (this.options.scope) {
                queryParameters.scope = this.options.scope;
            }
        } else {
            queryParameters.scope = parameters.scope;
        }

        if (Array.isArray(queryParameters.scope)) {
            queryParameters.scope = queryParameters.scope.join(' ');
        }

        return (
            this.options.authorizationEndpoint || removeDuplicateForwardSlashesFromURL(`${this.client.getUri()}/authorize`)
        ) + buildHTTPQuery(queryParameters);
    }
}
