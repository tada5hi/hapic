/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AuthorizeCodeChallengeMethod,
    AuthorizeDisplay,
    AuthorizePrompt,
    AuthorizeResponseMode,
    AuthorizeResponseType,
} from './constants';

/**
 * Value of an additional (non-typed) authorize parameter.
 * Arrays are joined with a space, numbers are stringified,
 * empty values are skipped.
 */
export type AuthorizeParameterValue = string | string[] | number | null | undefined;

export type AuthorizeParameters = {
    client_id?: string,
    redirect_uri?: string,
    response_mode?: `${AuthorizeResponseMode}`,
    /**
     * default: code
     */
    response_type?: `${AuthorizeResponseType}` | `${AuthorizeResponseType}`[],
    scope?: string | string[],
    state?: string,
    code_challenge?: string,
    code_challenge_method?: `${AuthorizeCodeChallengeMethod}`,

    // OpenID Connect Core 1.0 - 3.1.2.1 Authentication Request

    nonce?: string,
    display?: `${AuthorizeDisplay}`,
    prompt?: `${AuthorizePrompt}` | `${AuthorizePrompt}`[],
    /**
     * Maximum authentication age in seconds.
     */
    max_age?: number | string,
    ui_locales?: string | string[],
    id_token_hint?: string,
    login_hint?: string,
    acr_values?: string | string[],

    /**
     * Additional parameters (e.g. audience, resource),
     * appended after the parameters above in input order.
     */
    [key: string]: AuthorizeParameterValue,
};
