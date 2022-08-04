/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { JwtPayload } from 'jsonwebtoken';
import { Client, Config } from 'hapic';
import {
    AuthorizationGrantParameters,
    AuthorizeQueryParameters,
    ClientCredentialsGrantParameters,
    ClientOptions,
    GrantParameters,
    PasswordGrantParameters,
    RefreshTokenGrantParameters,
    TokenGrantResponse,
} from './type';
import { buildHTTPQuery, removeDuplicateForwardSlashesFromURL } from './utils';

export class OAuth2Client extends Client {
    protected options : ClientOptions;

    // -----------------------------------------------------------------------------------

    constructor(config?: Config & { options?: ClientOptions}) {
        super(config);

        config ??= {};

        this.options = config.options || {};
    }

    // ------------------------------------------------------------------

    async getTokenWithRefreshToken(
        parameters: Pick<RefreshTokenGrantParameters, 'refresh_token' | 'scope'>,
    ) {
        return this.getToken(this.buildTokenParameters({
            grant_type: 'refresh_token',
            ...parameters,
        }));
    }

    async getTokenWithClientCredentials(
        parameters?: Pick<ClientCredentialsGrantParameters, 'scope'>,
    ) {
        return this.getToken(this.buildTokenParameters({
            grant_type: 'client_credentials',
            ...(parameters || {}),
        }));
    }

    async getTokenWithPasswordGrant(
        parameters: Pick<PasswordGrantParameters, 'username' | 'password' | 'scope'>,
    ) {
        return this.getToken(this.buildTokenParameters({
            grant_type: 'password',
            ...parameters,
        }));
    }

    async getTokenWithAuthorizeGrant(
        parameters: Pick<AuthorizationGrantParameters, 'state' | 'code' | 'redirect_uri'>,
    ): Promise<TokenGrantResponse> {
        return this.getToken(this.buildTokenParameters({
            grant_type: 'authorization_code',
            ...parameters,
        }));
    }

    // ------------------------------------------------------------------

    /**
     * @throws Error
     * @param parameters
     */
    async getToken(parameters: GrantParameters): Promise<TokenGrantResponse> {
        const urlSearchParams = new URLSearchParams();
        const parameterKeys = Object.keys(parameters);

        for (let i = 0; i < parameterKeys.length; i++) {
            urlSearchParams.append(parameterKeys[i], (parameters as Record<string, any>)[parameterKeys[i]]);
        }

        const url: string = removeDuplicateForwardSlashesFromURL(
            (this.options.token_host || '') +
            (this.options.token_path || '/oauth/token'),
        );

        const { data } = await this.post(
            url,
            urlSearchParams,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        const tokenResponse: TokenGrantResponse = {
            access_token: data.access_token,
            expires_in: data.expires_in,
            token_type: data.token_type || 'Bearer',
        };

        if (data.refresh_token) {
            tokenResponse.refresh_token = data.refresh_token;
        }

        if (typeof data.id_token === 'string') {
            tokenResponse.id_token = data.id_token;
        }

        if (typeof data.mac_key === 'string') {
            tokenResponse.mac_key = data.mac_key;
        }

        if (typeof data.mac_algorithm === 'string') {
            tokenResponse.mac_algorithm = data.mac_algorithm;
        }

        return tokenResponse;
    }

    async introspectToken<T extends JwtPayload>(token: string, typeHint?: string) : Promise<T> {
        const url: string = removeDuplicateForwardSlashesFromURL(
            (this.options.token_host || '') +
            (this.options.token_path || '/oauth/token/introspect'),
        );

        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('token', token);

        if (typeHint) {
            urlSearchParams.append('token_type_hint', typeHint);
        }

        const { data } = await this.post(
            url,
            urlSearchParams,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );

        return data;
    }

    // ------------------------------------------------------------------

    /**
     * @throws Error
     * @param token
     */
    async getUserInfo<T extends Record<string, any>>(token: string) : Promise<T> {
        let url: string = this.options.user_info_host ?? (this.options.token_host || '');

        if (typeof this.options.user_info_path === 'string') {
            url += this.options.user_info_path;
        } else {
            url += '/userinfo';
        }

        const { data } = await this.get(
            removeDuplicateForwardSlashesFromURL(url),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return data;
    }

    // ------------------------------------------------------------------

    buildTokenParameters(parameters: GrantParameters): GrantParameters {
        if (this.options.client_id) {
            parameters.client_id = this.options.client_id;
        }

        if (
            parameters.grant_type !== 'authorization_code'
        ) {
            if (
                typeof parameters.scope === 'undefined' &&
                this.options.scope
            ) {
                parameters.scope = this.options.scope;
            }

            if (Array.isArray(parameters.scope)) {
                parameters.scope = parameters.scope.join(' ');
            }
        }

        if (
            parameters.grant_type === 'authorization_code'
        ) {
            if (typeof parameters.redirect_uri === 'undefined') {
                parameters.redirect_uri = this.options.redirect_uri;
            }
        }

        if (this.options.client_id) {
            parameters.client_id = this.options.client_id;
        }

        if (typeof this.options.client_secret === 'string') {
            parameters.client_secret = this.options.client_secret;
        }

        return parameters;
    }

    buildAuthorizeURL(parameters?: Partial<Pick<AuthorizeQueryParameters, 'redirect_uri' | 'scope'>>) {
        parameters = parameters ?? {};

        const queryParameters: AuthorizeQueryParameters = {
            response_type: 'code',
            ...(this.options.client_id ? { client_id: this.options.client_id } : {}),
            redirect_uri: this.options.redirect_uri,
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

        const host: string = this.options.authorize_host ?? (this.options.token_host || '');
        const path: string = this.options.authorize_path ?? '/oauth/authorize';

        return removeDuplicateForwardSlashesFromURL(host + path) + buildHTTPQuery(queryParameters);
    }
}
