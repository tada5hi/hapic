/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type TokenAuthorizationGrantParameters = {
    grant_type: 'authorization_code',
    state: string,
    code: string,
    redirect_uri?: string,
} & ClientAuthenticationParameters;

export type TokenRefreshTokenGrantParameters = {
    grant_type: 'refresh_token',
    refresh_token: string,
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type TokenGrantParameters =
    TokenClientCredentialsGrantParameters |
    TokenPasswordGrantParameters |
    TokenAuthorizationGrantParameters |
    TokenRefreshTokenGrantParameters;

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
