/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions, RequestTransformer } from 'hapic';
import { isHttpResponseError } from 'hapic';
import type { JwtPayload } from '../../types';

import { BaseAPI } from '../base';
import type {
    ClientAuthenticationParameters,
    TokenAuthorizationCodeGrantParameters,
    TokenBaseOptions,
    TokenClientCredentialsGrantParameters,
    TokenDeviceCodeGrantParameters,
    TokenDeviceCodePollParameters,
    TokenGrantParameters,
    TokenGrantResponse,
    TokenIntrospectParameters,
    TokenPasswordGrantParameters,
    TokenRefreshTokenGrantParameters,
    TokenRevokeParameters,
    TokenRobotCredentialsGrantParameters,
} from './types';
import {
    buildRequestOptionsForTokenAPIRequest,
    buildRequestTransformersForTokenAPIRequest,
    buildURLSearchParamsForTokenAPIRequest,
    extendClientAuthenticationParameters,
} from './utils/request-options';
import { wait } from './utils/wait';

/**
 * Default polling interval in seconds (RFC 8628 3.2).
 */
const DEVICE_CODE_POLL_INTERVAL = 5;

/**
 * Seconds added to the polling interval on a slow_down error (RFC 8628 3.5).
 */
const DEVICE_CODE_POLL_SLOW_DOWN = 5;

export class TokenAPI extends BaseAPI {
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
        parameters: Omit<TokenClientCredentialsGrantParameters, 'grant_type'> = {},
        options: TokenBaseOptions = {},
    ) {
        return this.create({
            grant_type: 'client_credentials',
            ...parameters,
        }, options);
    }

    async createWithPassword(
        parameters: Omit<TokenPasswordGrantParameters, 'grant_type'>,
        options: TokenBaseOptions = {},
    ) {
        return this.create({
            grant_type: 'password',
            ...parameters,
        }, options);
    }

    async createWithAuthorizationCode(
        parameters: Omit<TokenAuthorizationCodeGrantParameters, 'grant_type'>,
        options: TokenBaseOptions = {},
    ): Promise<TokenGrantResponse> {
        return this.create({
            grant_type: 'authorization_code',
            ...parameters,
        }, options);
    }

    async createWithRobotCredentials(
        parameters: Omit<TokenRobotCredentialsGrantParameters, 'grant_type'>,
        options: TokenBaseOptions = {},
    ) {
        return this.create({
            grant_type: 'robot_credentials',
            ...parameters,
        }, options);
    }

    async createWithDeviceCode(
        parameters: Omit<TokenDeviceCodeGrantParameters, 'grant_type'>,
        options: TokenBaseOptions = {},
    ): Promise<TokenGrantResponse> {
        return this.create({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            ...parameters,
        }, options);
    }

    /**
     * Poll the token endpoint with a device code until the user
     * completed the device authorization (RFC 8628 3.4, 3.5).
     *
     * Waits `interval` seconds (default 5) before each request. An
     * `authorization_pending` error continues polling, `slow_down` adds
     * 5 seconds to the interval; any other error is thrown. With `expires_in`,
     * the last of these errors is thrown once the next wait would end after
     * the deadline. Aborting `options.signal` rejects with its reason.
     *
     * @throws Error
     * @param parameters
     * @param options
     */
    async pollWithDeviceCode(
        parameters: TokenDeviceCodePollParameters,
        options: TokenBaseOptions = {},
    ): Promise<TokenGrantResponse> {
        const startedAt = Date.now();
        const deadline = typeof parameters.expires_in === 'number' ?
            startedAt + (parameters.expires_in * 1000) :
            undefined;

        let interval = typeof parameters.interval === 'number' && parameters.interval > 0 ?
            parameters.interval :
            DEVICE_CODE_POLL_INTERVAL;

        let lastError : unknown;

        while (true) {
            if (
                typeof lastError !== 'undefined' &&
                typeof deadline !== 'undefined' &&
                Date.now() + (interval * 1000) > deadline
            ) {
                throw lastError;
            }

            await wait(interval * 1000, options.signal);

            try {
                // fresh objects per request: create() and the transformers mutate them
                return await this.createWithDeviceCode(
                    this.pickDeviceCodeGrantParameters(parameters),
                    { ...options },
                );
            } catch (e) {
                const code = isHttpResponseError(e) ?
                    e.response?.data?.error :
                    undefined;

                if (code === 'slow_down') {
                    interval += DEVICE_CODE_POLL_SLOW_DOWN;
                } else if (code !== 'authorization_pending') {
                    throw e;
                }

                lastError = e;
            }
        }
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
            this.buildRequestOptions(parameters, options),
        );

        const tokenResponse: TokenGrantResponse = {
            access_token: data.access_token,
            expires_in: data.expires_in,
            token_type: data.token_type || 'Bearer',
        };

        if (data.refresh_token) {
            tokenResponse.refresh_token = data.refresh_token;
        }

        if (typeof data.refresh_token_expires_in === 'number') {
            tokenResponse.refresh_token_expires_in = data.refresh_token_expires_in;
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
            this.buildRequestOptions(parameters, options),
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
            this.buildRequestOptions(parameters, options),
        );

        return data;
    }

    protected buildRequestOptions(
        parameters: ClientAuthenticationParameters,
        options: TokenBaseOptions = {},
    ) : RequestBaseOptions {
        return buildRequestOptionsForTokenAPIRequest(
            this.buildRequestTransformers(parameters, options),
            options,
        );
    }

    protected buildRequestTransformers(
        parameters: ClientAuthenticationParameters,
        options: TokenBaseOptions = {},
    ) : RequestTransformer[] {
        return buildRequestTransformersForTokenAPIRequest(
            this.client,
            this.options,
            parameters,
            options,
        );
    }

    protected pickDeviceCodeGrantParameters(
        parameters: TokenDeviceCodePollParameters,
    ) : Omit<TokenDeviceCodeGrantParameters, 'grant_type'> {
        const output : Omit<TokenDeviceCodeGrantParameters, 'grant_type'> = { device_code: parameters.device_code };

        if (parameters.client_id) {
            output.client_id = parameters.client_id;
        }

        if (parameters.client_secret) {
            output.client_secret = parameters.client_secret;
        }

        if (parameters.realm_id) {
            output.realm_id = parameters.realm_id;
        }

        return output;
    }

    // ------------------------------------------------------------------

    extendCreateParameters(parameters: TokenGrantParameters): TokenGrantParameters {
        if (
            parameters.grant_type !== 'authorization_code' &&
            parameters.grant_type !== 'robot_credentials' &&
            parameters.grant_type !== 'urn:ietf:params:oauth:grant-type:device_code'
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

        extendClientAuthenticationParameters(parameters, this.options);

        return parameters;
    }

    // ------------------------------------------------------------------

    protected buildURLSearchParams(
        input: Record<string, any>,
    ) : URLSearchParams {
        return buildURLSearchParamsForTokenAPIRequest(input);
    }
}
