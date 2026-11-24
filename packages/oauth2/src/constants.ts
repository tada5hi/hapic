/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ResponseType {
    NONE = 'none',
    CODE = 'code',
    ID_TOKEN = 'id_token',
    TOKEN = 'token',
}

/**
 * Token type identifiers (RFC 8693 3), e.g. for the
 * `subject_token_type` of a token exchange.
 */
export enum TokenTypeIdentifier {
    ACCESS_TOKEN = 'urn:ietf:params:oauth:token-type:access_token',
    REFRESH_TOKEN = 'urn:ietf:params:oauth:token-type:refresh_token',
    ID_TOKEN = 'urn:ietf:params:oauth:token-type:id_token',
    SAML1 = 'urn:ietf:params:oauth:token-type:saml1',
    SAML2 = 'urn:ietf:params:oauth:token-type:saml2',
    JWT = 'urn:ietf:params:oauth:token-type:jwt',
}
