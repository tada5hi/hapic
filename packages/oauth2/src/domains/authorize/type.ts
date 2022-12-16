/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AuthorizeResponseMode } from './constants';

export type AuthorizeParameters = {
    client_id?: string,
    redirect_uri: string,
    response_mode?: `${AuthorizeResponseMode}`,
    response_type: string,
    scope?: string,
    state?: string
};

export type AuthorizeParametersInput = Omit<AuthorizeParameters, 'scope'> & {
    scope?: string | string[],
};
