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
};

export type TokenClientCredentialsGrantParameters = {
    grant_type: 'client_credentials',
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type TokenPasswordGrantParameters = {
    grant_type: 'password',
    username: string,
    password: string,
    scope?: string | string[],
    realm_id?: string,
    realm_name?: string,
} & ClientAuthenticationParameters;

export type TokenAuthorizationCodeGrantParameters = {
    grant_type: 'authorization_code',
    state: string,
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

export type TokenGrantParameters =
    TokenClientCredentialsGrantParameters |
    TokenPasswordGrantParameters |
    TokenAuthorizationCodeGrantParameters |
    TokenRefreshTokenGrantParameters |
    TokenRobotCredentialsGrantParameters;

// ------------------------------------------------------------------

export type TokenGrantResponse = {
    access_token: string,

    refresh_token?: string,

    expires_in: number,

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
     * If this options is enabled, the client credentials will
     * be stripped as request parameters and set as header if present.
     *
     * default: false
     */
    clientCredentialsAsHeader?: boolean
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
