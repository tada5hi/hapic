/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
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

export type ClientOptions = {
    client_id?: string,
    client_secret?: string,

    scope?: string | string[],

    redirect_uri?: string,

    token_host?: string,
    token_path?: string,
    token_introspect_path?: string,

    authorize_host?: string,
    authorize_path?: string,

    user_info_host?: string,
    user_info_path?: string
};

// ------------------------------------------------------------------

export type AuthorizeQueryParameters = {
    response_type: 'code',
    client_id?: string,
    redirect_uri: string,
    scope?: string | string[]
};

// ------------------------------------------------------------------

export type ClientAuthenticationParameters = {
    client_id?: string,
    client_secret?: string,
};

export type ClientCredentialsGrantParameters = {
    grant_type: 'client_credentials',
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type PasswordGrantParameters = {
    grant_type: 'password',
    username: string,
    password: string,
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type AuthorizationGrantParameters = {
    grant_type: 'authorization_code',
    state: string,
    code: string,
    redirect_uri?: string,
} & ClientAuthenticationParameters;

export type RefreshTokenGrantParameters = {
    grant_type: 'refresh_token',
    refresh_token: string,
    scope?: string | string[]
} & ClientAuthenticationParameters;

export type GrantParameters =
    ClientCredentialsGrantParameters |
    PasswordGrantParameters |
    AuthorizationGrantParameters |
    RefreshTokenGrantParameters;
