/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationHeader } from 'hapic';

export type ClientAuthenticationParameters = {
    client_id?: string,
    client_secret?: string,
    realm_id?: string,
};

export type TokenClientCredentialsGrantParameters = {
    grant_type: 'client_credentials',
    scope?: string | string[],
    realm_name?: string,
} & ClientAuthenticationParameters;

export type TokenPasswordGrantParameters = {
    grant_type: 'password',
    username: string,
    password: string,
    scope?: string | string[],
    realm_name?: string,
} & ClientAuthenticationParameters;

export type TokenAuthorizationCodeGrantParameters = {
    grant_type: 'authorization_code',
    code: string,
    code_verifier?: string,
    redirect_uri?: string,
} & ClientAuthenticationParameters;

export type TokenRefreshTokenGrantParameters = {
    grant_type: 'refresh_token',
    refresh_token: string,
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type TokenRobotCredentialsGrantParameters = {
    grant_type: 'robot_credentials',
    id: string,
    secret: string,
} & ClientAuthenticationParameters;

/**
 * Device access token request (RFC 8628 3.4).
 */
export type TokenDeviceCodeGrantParameters = {
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    device_code: string,
} & ClientAuthenticationParameters;

export type TokenGrantParameters =    TokenClientCredentialsGrantParameters |
    TokenPasswordGrantParameters |
    TokenAuthorizationCodeGrantParameters |
    TokenRefreshTokenGrantParameters |
    TokenRobotCredentialsGrantParameters |
    TokenDeviceCodeGrantParameters;

/**
 * Parameters for polling the token endpoint with a device code (RFC 8628 3.4, 3.5).
 * A device authorization response can be passed as is; only the device code and
 * the client authentication parameters are sent.
 */
export type TokenDeviceCodePollParameters = Omit<TokenDeviceCodeGrantParameters, 'grant_type'> & {
    /**
     * Seconds to wait before each request.
     *
     * default: 5
     */
    interval?: number,

    /**
     * Lifetime of the device code in seconds, measured from the start of polling.
     * Polling stops with the last error once the next wait would end after it.
     *
     * default: undefined (no deadline)
     */
    expires_in?: number,
};

// ------------------------------------------------------------------

export type TokenGrantResponse = {
    access_token: string,

    refresh_token?: string,

    expires_in: number,

    refresh_token_expires_in?: number,

    token_type: string,

    id_token?: string,

    mac_key?: string,

    mac_algorithm?: string,

    scope?: string
};

// ------------------------------------------------------------------

export type TokenBaseOptions = {
    /**
     * Inherit existing driver authorization header for
     * current request.
     *
     * default: false
     */
    authorizationHeaderInherit?: boolean,

    /**
     * Set a custom authorization header or disable
     * setting an authorization at all for the current request.
     *
     * default: undefined
     */
    authorizationHeader?: string | AuthorizationHeader,

    /**
     * Custom client id for
     * current request.
     *
     * default: undefined
     */
    clientId?: string,

    /**
     * Custom client secret for
     * current request.
     *
     * default: undefined
     */
    clientSecret?: string

    /**
     * Custom realm for
     * current request.
     *
     * default: undefined
     */
    realmId?: string,

    /**
     * If this options is enabled, the client credentials will
     * be stripped as request parameters and set as header if present.
     *
     * default: false
     */
    clientCredentialsAsHeader?: boolean,

    /**
     * Abort the current request with this signal.
     *
     * default: undefined
     */
    signal?: AbortSignal,

    /**
     * Abort the current request after this many milliseconds.
     * Overrides the client timeout.
     *
     * default: undefined (the client timeout)
     */
    timeout?: number
};

// ------------------------------------------------------------------

export type TokenRevokeParameters = {
    token?: string,
    token_type_hint?: string
} & ClientAuthenticationParameters;

// ------------------------------------------------------------------

export type TokenIntrospectParameters = {
    token?: string,
    token_type_hint?: string,
} & ClientAuthenticationParameters;
