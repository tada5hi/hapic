/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizeCodeChallenge, AuthorizeResponseMode } from './constants';

export type AuthorizeParameters = {
    client_id?: string,
    redirect_uri?: string,
    response_mode?: `${AuthorizeResponseMode}`,
    /**
     * default: code
     */
    response_type?: string,
    scope?: string | string[],
    state?: string,
    code_challenge?: string,
    code_challenge_method?: `${AuthorizeCodeChallenge}`
};
