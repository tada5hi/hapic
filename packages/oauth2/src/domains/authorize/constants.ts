/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum AuthorizeResponseMode {
    QUERY = 'query',
    FRAGMENT = 'fragment',
    FORM_POST = 'form_post',
    WEB_MESSAGE = 'web_message',
}

export enum AuthorizeCodeChallenge {
    SHA_256 = 'S256',
    PLAIN = 'plain',
}

export enum AuthorizeParameterName {
    CLIENT_ID = 'client_id',
    REDIRECT_URI = 'redirect_uri',
    RESPONSE_MODE = 'response_mode',
    RESPONSE_TYPE = 'response_type',
    SCOPE = 'scope',
    STATE = 'state',
    CODE_CHALLENGE = 'code_challenge',
    CODE_CHALLENGE_METHOD = 'code_challenge_method',
}
