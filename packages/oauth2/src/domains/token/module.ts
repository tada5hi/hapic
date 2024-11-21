/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestTransformer } from 'hapic';
import { HeaderName } from 'hapic';
import type { JwtPayload } from '../../type';

import { BaseAPI } from '../base';
import type {
    ClientAuthenticationParameters,
    TokenAuthorizationCodeGrantParameters,
    TokenBaseOptions,
    TokenClientCredentialsGrantParameters,
    TokenGrantParameters,
    TokenGrantResponse,
    TokenIntrospectParameters,
    TokenPasswordGrantParameters,
    TokenRefreshTokenGrantParameters,
    TokenRevokeParameters,
    TokenRobotCredentialsGrantParameters,
} from './type';
import { createRequestTransformerForTokenAPIRequest } from './utils';

export class TokenAPI extends BaseAPI {
    // ------------------------------------------------------------------

    async createWithRefreshToken(
        parameters: Omit<TokenRefreshTokenGrantParameters, 'grant_type'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'refresh_token',
            ...parameters,
        }, options);
    }

    async createWithClientCredentials(
        parameters?: Omit<TokenClientCredentialsGrantParameters, 'grant_type'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'client_credentials',
            ...(parameters || {}),
        }, options);
    }

    async createWithPassword(
        parameters: Omit<TokenPasswordGrantParameters, 'grant_type'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'password',
            ...parameters,
        }, options);
    }

    async createWithAuthorizationCode(
        parameters: Omit<TokenAuthorizationCodeGrantParameters, 'grant_type'>,
        options?: TokenBaseOptions,
    ): Promise<TokenGrantResponse> {
        return this.create({
            grant_type: 'authorization_code',
            ...parameters,
        }, options);
    }

    async createWithRobotCredentials(
        parameters: Omit<TokenRobotCredentialsGrantParameters, 'grant_type'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'robot_credentials',
            ...parameters,
        }, options);
    }

    // ------------------------------------------------------------------

    /**
     * @throws Error
     * @param parameters
     * @param options
     */
    async create(
        parameters: TokenGrantParameters,
        options: TokenBaseOptions = {},
    ): Promise<TokenGrantResponse> {
        this.extendCreateParameters(parameters);

        const urlSearchParams = this.buildURLSearchParams(parameters);

        const { data } = await this.client.post(
            (this.options.tokenEndpoint || '/token'),
            urlSearchParams,
            {
                transform: this.buildRequestTransformers(parameters, options),
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
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

    async revoke(
        parameters: TokenRevokeParameters = {},
        options: TokenBaseOptions = {},
    ) {
        const urlSearchParams = this.buildURLSearchParams(parameters);

        return this.client.post(
            (this.options.revocationEndpoint || '/token/revoke'),
            urlSearchParams,
            {
                transform: this.buildRequestTransformers(parameters, options),
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
                },
            },
        );
    }

    async introspect<T extends JwtPayload>(
        parameters: TokenIntrospectParameters = {},
        options: TokenBaseOptions = {},
    ): Promise<T> {
        const urlSearchParams = this.buildURLSearchParams(parameters);

        const { data } = await this.client.post(
            this.options.introspectionEndpoint || '/token/introspect',
            urlSearchParams,
            {
                transform: this.buildRequestTransformers(parameters, options),
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
                },
            },
        );

        return data;
    }

    protected buildRequestTransformers(
        parameters: ClientAuthenticationParameters,
        options: TokenBaseOptions = {},
    ) : RequestTransformer[] {
        const transformers : RequestTransformer[] = [];

        if (!options.clientId) {
            if (this.options.clientId) {
                options.clientId = this.options.clientId;
            }

            if (this.options.clientSecret) {
                options.clientSecret = this.options.clientSecret;
            }
        }

        transformers.push(createRequestTransformerForTokenAPIRequest(parameters, options));

        if (this.client.defaults.transform) {
            if (Array.isArray(this.client.defaults.transform)) {
                transformers.push(...this.client.defaults.transform);
            } else {
                transformers.push(this.client.defaults.transform);
            }
        }

        return transformers;
    }

    // ------------------------------------------------------------------

    extendCreateParameters(parameters: TokenGrantParameters): TokenGrantParameters {
        if (
            parameters.grant_type !== 'authorization_code' &&
            parameters.grant_type !== 'robot_credentials'
        ) {
            if (!parameters.scope && this.options.scope) {
                parameters.scope = this.options.scope;
            }
        }

        if (parameters.grant_type === 'authorization_code') {
            if (!parameters.redirect_uri && this.options.redirectUri) {
                parameters.redirect_uri = this.options.redirectUri;
            }
        }

        if (!parameters.client_id) {
            if (parameters.client_secret) {
                delete parameters.client_secret;
            }

            if (this.options.clientId) {
                parameters.client_id = this.options.clientId;
            }

            if (this.options.clientSecret) {
                parameters.client_secret = this.options.clientSecret;
            }
        }

        return parameters;
    }

    // ------------------------------------------------------------------

    protected buildURLSearchParams(
        input: Record<string, any>,
    ) : URLSearchParams {
        const urlSearchParams = new URLSearchParams();
        const keys = Object.keys(input);
        for (let i = 0; i < keys.length; i++) {
            const value = input[keys[i]];

            if (typeof value === 'string' && !!value) {
                urlSearchParams.append(keys[i], value);
            } else if (Array.isArray(value)) {
                const str = value.filter((el) => el).join(' ');
                if (str) {
                    urlSearchParams.append(keys[i], str);
                }
            }
        }

        return urlSearchParams;
    }
}
