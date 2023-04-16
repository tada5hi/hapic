import type { RequestOptions } from 'hapic';

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

export type Config = {
    request: RequestOptions,
    options: Options
};
export type ConfigInput = Partial<Config>;
