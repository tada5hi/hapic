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
/**
 * Parameters an authorization server defines beyond the specification,
 * e.g. Authup's `realm_name` or space separated `cap`. Numbers and
 * booleans are stringified, arrays are joined with spaces.
 */
export type TokenExtensionParameters = Record<string, string | number | boolean | string[] | undefined>;

/**
 * Device access token request without the grant type (RFC 8628 3.4).
 *
 * EXTENSION types parameters the authorization server defines beyond
 * RFC 8628; `createWithDeviceCode` and `pollWithDeviceCode` infer it
 * from the object passed.
 */
export type TokenDeviceCodeParameters<
    EXTENSION extends TokenExtensionParameters = Record<never, never>,
> = {
    device_code: string,
} & ClientAuthenticationParameters &
    EXTENSION;

export type TokenDeviceCodeGrantParameters<
    EXTENSION extends TokenExtensionParameters = Record<never, never>,
> = {
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
} & TokenDeviceCodeParameters<EXTENSION>;

/**
 * The actor of a token exchange (RFC 8693 2.1):
 * `actor_token_type` is required when `actor_token` is present.
 */
export type TokenTokenExchangeActorParameters = {
    actor_token?: undefined,
    actor_token_type?: undefined,
} | {
    /**
     * Token representing the acting party.
     */
    actor_token: string,
    /**
     * Type of the actor token, e.g. TokenTypeIdentifier.ACCESS_TOKEN.
     */
    actor_token_type: string,
};

/**
 * Token exchange request without the grant type (RFC 8693 2.1).
 *
 * EXTENSION types parameters the authorization server defines
 * beyond RFC 8693; `createWithTokenExchange` infers it from the
 * object passed.
 */
export type TokenTokenExchangeParameters<
    EXTENSION extends TokenExtensionParameters = Record<never, never>,
> = {
    /**
     * Token representing the party on whose behalf the request is made.
     */
    subject_token: string,
    /**
     * Type of the subject token, e.g. TokenTypeIdentifier.ACCESS_TOKEN.
     */
    subject_token_type: string,
    /**
     * Type of the requested token, e.g. TokenTypeIdentifier.ACCESS_TOKEN.
     */
    requested_token_type?: string,
    /**
     * Logical name(s) of the target service. An array repeats the parameter.
     */
    audience?: string | string[],
    /**
     * URI(s) of the target service (RFC 8707). An array repeats the parameter.
     */
    resource?: string | string[],
    /**
     * An array is joined with spaces.
     */
    scope?: string | string[],
} & TokenTokenExchangeActorParameters &
    ClientAuthenticationParameters &
    EXTENSION;

/**
 * Token exchange request (RFC 8693 2.1).
 */
export type TokenTokenExchangeGrantParameters<
    EXTENSION extends TokenExtensionParameters = Record<never, never>,
> = {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
} & TokenTokenExchangeParameters<EXTENSION>;

export type TokenGrantParameters =    TokenClientCredentialsGrantParameters |
    TokenPasswordGrantParameters |
    TokenAuthorizationCodeGrantParameters |
    TokenRefreshTokenGrantParameters |
    TokenRobotCredentialsGrantParameters |
    TokenDeviceCodeGrantParameters |
    TokenTokenExchangeGrantParameters;

/**
 * Parameters for polling the token endpoint with a device code (RFC 8628 3.4, 3.5).
 * A device authorization response can be passed as is: every parameter is
 * sent except the poll controls (interval, expires_in) and the fields only
 * shown to the user (user_code, verification_uri, verification_uri_complete).
 */
export type TokenDeviceCodePollParameters<
    EXTENSION extends TokenExtensionParameters = Record<never, never>,
> = TokenDeviceCodeParameters<EXTENSION> & {
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

    /**
     * Not sent (device authorization response).
     */
    user_code?: string,

    /**
     * Not sent (device authorization response).
     */
    verification_uri?: string,

    /**
     * Not sent (device authorization response).
     */
    verification_uri_complete?: string,
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

    /**
     * Type of the issued token, sent in a token exchange response
     * (RFC 8693 2.2.1), e.g. TokenTypeIdentifier.ACCESS_TOKEN.
     */
    issued_token_type?: string,

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
