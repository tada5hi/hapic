/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, ClientDriverInstance } from 'hapic';
import type {
    ClientOptions,
    JwtPayload,
} from '../../type';

import { BaseOAuth2API } from '../base';
import type {
    TokenAuthorizationGrantParameters, TokenClientCredentialsGrantParameters,
    TokenGrantParameters,
    TokenGrantResponse,
    TokenPasswordGrantParameters, TokenRefreshTokenGrantParameters, TokenRobotCredentialsGrantParameters,
} from './type';

export class TokenAPI extends BaseOAuth2API {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(
        client: Client | ClientDriverInstance,
        options?: ClientOptions,
    ) {
        super(client, options);
    }

    // ------------------------------------------------------------------

    async createWithRefreshToken(
        parameters: Pick<TokenRefreshTokenGrantParameters, 'refresh_token' | 'scope'>,
    ) {
        return this.create(this.buildTokenParameters({
            grant_type: 'refresh_token',
            ...parameters,
        }));
    }

    async createWithClientCredentials(
        parameters?: Pick<TokenClientCredentialsGrantParameters, 'scope'>,
    ) {
        return this.create(this.buildTokenParameters({
            grant_type: 'client_credentials',
            ...(parameters || {}),
        }));
    }

    async createWithPasswordGrant(
        parameters: Pick<TokenPasswordGrantParameters, 'username' | 'password' | 'scope'>,
    ) {
        return this.create(this.buildTokenParameters({
            grant_type: 'password',
            ...parameters,
        }));
    }

    async createWithAuthorizeGrant(
        parameters: Pick<TokenAuthorizationGrantParameters, 'state' | 'code' | 'redirect_uri'>,
    ): Promise<TokenGrantResponse> {
        return this.create(this.buildTokenParameters({
            grant_type: 'authorization_code',
            ...parameters,
        }));
    }

    async createWithRobotCredentials(
        parameters: Pick<TokenRobotCredentialsGrantParameters, 'id' | 'secret'>,
    ) {
        return this.create(this.buildTokenParameters({
            grant_type: 'robot_credentials',
            ...parameters,
        }));
    }

    // ------------------------------------------------------------------

    /**
     * @throws Error
     * @param parameters
     */
    async create(parameters: TokenGrantParameters): Promise<TokenGrantResponse> {
        const urlSearchParams = new URLSearchParams();
        const parameterKeys = Object.keys(parameters);

        for (let i = 0; i < parameterKeys.length; i++) {
            urlSearchParams.append(parameterKeys[i], (parameters as Record<string, any>)[parameterKeys[i]]);
        }

        const { data } = await this.client.post(
            (this.options.token_endpoint || '/token'),
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

    async introspect<T extends JwtPayload>(token: string, typeHint?: string) : Promise<T> {
        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('token', token);

        if (typeHint) {
            urlSearchParams.append('token_type_hint', typeHint);
        }

        const { data } = await this.client.post(
            this.options.introspection_endpoint || '/token/introspect',
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

    buildTokenParameters(parameters: TokenGrantParameters): TokenGrantParameters {
        if (this.options.client_id) {
            parameters.client_id = this.options.client_id;
        }

        if (
            parameters.grant_type !== 'authorization_code' &&
            parameters.grant_type !== 'robot_credentials'
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
}
