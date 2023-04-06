/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Config as BaseConfig } from 'hapic';
import type { ResponseType } from './constants';

export type Options = {
    /**
     * The client ID provided by the OAuth2 server.
     */
    clientId?: string,

    /**
     * The client secret provided by the OAuth2 server.
     */
    clientSecret?: string,

    /**
     * The scopes to request from the OAuth2 server.
     */
    scope?: string | string[],

    /**
     * The redirect URI to use for authorization grants.
     */
    redirectUri?: string,

    /**
     * The token endpoint URL provided by the OAuth2 server.
     */
    tokenEndpoint?: string,

    /**
     * The introspection endpoint URL provided by the OAuth2 server.
     */
    introspectionEndpoint?: string,

    /**
     * The authorization endpoint URL provided by the OAuth2 server.
     */
    authorizationEndpoint?: string,

    /**
     * The userinfo endpoint URL provided by the OAuth2 server.
     */
    userinfoEndpoint?: string,
};

export type Config = BaseConfig & {
    options?: Options
};

export type ConfigInput = Partial<Config>;

// ------------------------------------------------------------------

// standard claims https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
export type JwtPayload = {
    [key: string]: any;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    exp?: number | undefined;
    nbf?: number | undefined;
    iat?: number | undefined;
    jti?: string | undefined;
};

// ------------------------------------------------------------------

// https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#Combinations
export type ResponseTypeCombinations = `${ResponseType.CODE} ${ResponseType.TOKEN}` |
    `${ResponseType.CODE} ${ResponseType.ID_TOKEN}` |
    `${ResponseType.ID_TOKEN} ${ResponseType.TOKEN}` |
    `${ResponseType.CODE} ${ResponseType.ID_TOKEN} ${ResponseType.TOKEN}`;
