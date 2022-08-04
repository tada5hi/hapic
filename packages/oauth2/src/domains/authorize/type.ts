/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type AuthorizeQueryParameters = {
    response_type: 'code',
    client_id?: string,
    redirect_uri: string,
    scope?: string | string[]
};
