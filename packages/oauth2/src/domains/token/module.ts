/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestTransformer } from 'hapic';
import type { JwtPayload } from '../../type';

import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../type';
import type {
    ClientAuthenticationParameters,
    TokenAuthorizationGrantParameters,
    TokenBaseOptions,
    TokenClientCredentialsGrantParameters,
    TokenGrantParameters,
    TokenGrantResponse,
    TokenIntrospectParameters,
    TokenPasswordGrantParameters,
    TokenRefreshTokenGrantParameters,
    TokenRobotCredentialsGrantParameters,
} from './type';
import { createRequestTransformerForTokenAPIRequest } from './utils';

export class TokenAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    // ------------------------------------------------------------------

    async createWithRefreshToken(
        parameters: Pick<TokenRefreshTokenGrantParameters, 'refresh_token' | 'scope'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'refresh_token',
            ...parameters,
        }, options);
    }

    async createWithClientCredentials(
        parameters?: Pick<TokenClientCredentialsGrantParameters, 'scope'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'client_credentials',
            ...(parameters || {}),
        }, options);
    }

    async createWithPasswordGrant(
        parameters: Pick<TokenPasswordGrantParameters, 'username' | 'password' | 'scope'>,
        options?: TokenBaseOptions,
    ) {
        return this.create({
            grant_type: 'password',
            ...parameters,
        }, options);
    }

    async createWithAuthorizeGrant(
        parameters: Pick<TokenAuthorizationGrantParameters, 'state' | 'code' | 'redirect_uri'>,
        options?: TokenBaseOptions,
    ): Promise<TokenGrantResponse> {
        return this.create({
            grant_type: 'authorization_code',
            ...parameters,
        }, options);
    }

    async createWithRobotCredentials(
        parameters: Pick<TokenRobotCredentialsGrantParameters, 'id' | 'secret'>,
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
        options?: TokenBaseOptions,
    ): Promise<TokenGrantResponse> {
        options = options || {};

        this.extendCreateParameters(parameters);

        const urlSearchParams = this.buildURLSearchParams(parameters);

        const { data } = await this.client.post(
            (this.options.tokenEndpoint || '/token'),
            urlSearchParams,
            {
                transform: this.buildRequestTransformers(parameters, options),
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

    async introspect<T extends JwtPayload>(
        parameters: TokenIntrospectParameters,
        options?: TokenBaseOptions,
    ): Promise<T> {
        options = options || {};

        const urlSearchParams = this.buildURLSearchParams(parameters);

        const { data } = await this.client.post(
            this.options.introspectionEndpoint || '/token/introspect',
            urlSearchParams,
            {
                transform: this.buildRequestTransformers(parameters, options),
            },
        );

        return data;
    }

    protected buildRequestTransformers(
        parameters: ClientAuthenticationParameters,
        options?: TokenBaseOptions,
    ) : RequestTransformer[] {
        const transformers : RequestTransformer[] = [];

        options = options || {};
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

    protected buildURLSearchParams<T extends ClientAuthenticationParameters>(
        input: T,
    ) : URLSearchParams {
        const urlSearchParams = new URLSearchParams();
        const keys = Object.keys(input);
        for (let i = 0; i < keys.length; i++) {
            const value = input[keys[i] as keyof T];

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
