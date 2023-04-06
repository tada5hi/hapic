/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { stringifyAuthorizationHeader } from 'hapic';
import type {
    ClientDriverHeaders,
} from 'hapic';
import type {
    JwtPayload,
} from '../../type';

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
        return this.create(this.extendCreateParameters({
            grant_type: 'refresh_token',
            ...parameters,
        }), options);
    }

    async createWithClientCredentials(
        parameters?: Pick<TokenClientCredentialsGrantParameters, 'scope'>,
        options?: TokenBaseOptions,
    ) {
        return this.create(this.extendCreateParameters({
            grant_type: 'client_credentials',
            ...(parameters || {}),
        }), options);
    }

    async createWithPasswordGrant(
        parameters: Pick<TokenPasswordGrantParameters, 'username' | 'password' | 'scope'>,
        options?: TokenBaseOptions,
    ) {
        return this.create(this.extendCreateParameters({
            grant_type: 'password',
            ...parameters,
        }), options);
    }

    async createWithAuthorizeGrant(
        parameters: Pick<TokenAuthorizationGrantParameters, 'state' | 'code' | 'redirect_uri'>,
        options?: TokenBaseOptions,
    ): Promise<TokenGrantResponse> {
        return this.create(this.extendCreateParameters({
            grant_type: 'authorization_code',
            ...parameters,
        }), options);
    }

    async createWithRobotCredentials(
        parameters: Pick<TokenRobotCredentialsGrantParameters, 'id' | 'secret'>,
        options?: TokenBaseOptions,
    ) {
        return this.create(this.extendCreateParameters({
            grant_type: 'robot_credentials',
            ...parameters,
        }), options);
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
        this.extendParametersWithClientCredentials(parameters);

        const urlSearchParams = this.buildURLSearchParams(parameters, options);

        const { data } = await this.driver.post(
            (this.options.tokenEndpoint || '/token'),
            urlSearchParams,
            {
                transformRequest: /* istanbul ignore next */ (data, headers) => {
                    options = options || {};
                    if (!options.clientId) {
                        options.clientId = parameters.client_id;
                        options.clientSecret = parameters.client_secret;
                    }

                    this.transformHeadersForRequest(headers, options);

                    return data;
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

    async introspect<T extends JwtPayload>(
        parameters: TokenIntrospectParameters,
        options?: TokenBaseOptions,
    ): Promise<T> {
        this.extendParametersWithClientCredentials(parameters);

        const urlSearchParams = this.buildURLSearchParams(parameters, options);

        const { data } = await this.driver.post(
            this.options.introspectionEndpoint || '/token/introspect',
            urlSearchParams,
            {
                transformRequest: /* istanbul ignore next */ (data, headers) => {
                    options = options || {};

                    if (!options.clientId) {
                        options.clientId = parameters.client_id;
                        options.clientSecret = parameters.client_secret;
                    }

                    this.transformHeadersForRequest(headers, options);

                    return data;
                },
            },
        );

        return data;
    }

    /**
     * Set Content-Type and Authorization Header for request.
     *
     * @param headers
     * @param options
     */
    transformHeadersForRequest(
        headers: ClientDriverHeaders,
        options?: TokenBaseOptions,
    ) : void {
        options = options || {};

        // set content type
        headers.set('Content-Type', 'application/x-www-form-urlencoded');

        if (
            options.authorizationHeaderInherit &&
            headers.has('Authorization')
        ) {
            return;
        }

        // request should be in general unauthorized
        headers.delete('Authorization');

        if (options.authorizationHeader) {
            const header = typeof options.authorizationHeader === 'string' ?
                options.authorizationHeader :
                stringifyAuthorizationHeader(options.authorizationHeader);

            headers.set('Authorization', header);

            return;
        }

        if (options.clientId && options.clientSecret) {
            headers.set('Authorization', stringifyAuthorizationHeader({
                type: 'Basic',
                username: options.clientId,
                password: options.clientSecret,
            }));

            return;
        }

        if (this.options.clientId && this.options.clientSecret) {
            headers.set('Authorization', stringifyAuthorizationHeader({
                type: 'Basic',
                username: this.options.clientId,
                password: this.options.clientSecret,
            }));
        }
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

        this.extendParametersWithClientCredentials(parameters);

        return parameters;
    }

    protected extendParametersWithClientCredentials<T extends ClientAuthenticationParameters>(input: T) : T {
        if (input.client_id) {
            return input;
        }

        // secret should not be set if id is not
        if (input.client_secret) {
            delete input.client_secret;
        }

        if (this.options.clientId) {
            input.client_id = this.options.clientId;
        }

        if (input.client_id && this.options.clientSecret) {
            input.client_secret = this.options.clientSecret;
        }

        return input;
    }

    // ------------------------------------------------------------------

    protected buildURLSearchParams<T extends ClientAuthenticationParameters>(
        input: T,
        options?: TokenBaseOptions,
    ) : URLSearchParams {
        options = options || {};

        const setClientCredentialsHeader = this.hasClientCredentials(input) &&
            !options.authorizationHeaderInherit &&
            !options.authorizationHeader;

        const urlSearchParams = new URLSearchParams();
        const keys = Object.keys(input);
        for (let i = 0; i < keys.length; i++) {
            if (
                setClientCredentialsHeader &&
                (keys[i] === 'client_id' || keys[i] === 'client_secret')
            ) {
                continue;
            }

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

    /**
     * Check if client credentials are available.
     *
     * @param options
     */
    protected hasClientCredentials(options?: ClientAuthenticationParameters) : boolean {
        options = options || {};

        return (!!options.client_id && !!options.client_secret) ||
            (!!this.options.clientId && !!this.options.clientSecret);
    }
}
