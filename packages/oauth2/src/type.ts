/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ClientOptions = {
    /**
     * The client ID provided by the OAuth2 server.
     */
    client_id?: string,

    /**
     * The client secret provided by the OAuth2 server.
     */
    client_secret?: string,

    /**
     * Indicates whether to include the client credentials in the Basic Authorization header
     * for token requests.
     */
    client_authentication_with_header?: boolean,

    /**
     * The scopes to request from the OAuth2 server.
     */
    scope?: string | string[],

    /**
     * The redirect URI to use for authorization grants.
     */
    redirect_uri?: string,

    /**
     * The token endpoint URL provided by the OAuth2 server.
     */
    token_endpoint?: string,

    /**
     * The introspection endpoint URL provided by the OAuth2 server.
     */
    introspection_endpoint?: string,

    /**
     * The authorization endpoint URL provided by the OAuth2 server.
     */
    authorization_endpoint?: string,

    /**
     * The userinfo endpoint URL provided by the OAuth2 server.
     */
    userinfo_endpoint?: string,
};

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

export type OpenIDProviderMetadata = {
    /**
     * The fully qualified issuer URL of the server
     */
    issuer: string,

    /**
     * The fully qualified URL of the server’s authorization endpoint defined by RFC 6749
     */
    authorization_endpoint: string,

    /**
     * The fully qualified URI of the server’s public key in JSON Web Key Set (JWKS) format
     */
    jwks_uri: string,

    /**
     * List of the supported OAuth 2.0 response_type values.
     */
    response_type_supported: ('none' | 'code' | 'token' | 'id_token')[],

    /**
     * List of the supported subject (end-user) identifier types.
     */
    subject_types_supported: string[],

    /**
     * e.g. "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "none"
     */
    id_token_signing_alg_values_supported: string[],

    /**
     * The fully qualified URL of the server’s token endpoint defined by RFC 6749
     */
    token_endpoint: string,

    /**
     *  The fully qualified URL of the server’s introspection_endpoint defined by OAuth 2.0 Token Introspection
     */
    introspection_endpoint: string,

    /**
     * The fully qualified URL of the server’s revocation endpoint defined by OAuth 2.0 Authorization Server
     * Metadata (and sort of in OAuth 2.0 Token Revocation)
     */
    revocation_endpoint: string,

    /**
     * The OAuth 2.0 / OpenID Connect URL of the OP's Dynamic Client Registration Endpoint OpenID.Registration.
     */
    registration_endpoint?: string,

    /**
     * The service documentation URL.
     */
    service_documentation?: string,

    /**
     * The OpenID Connect UserInfo endpoint URL.
     */
    userinfo_endpoint?: string
};
