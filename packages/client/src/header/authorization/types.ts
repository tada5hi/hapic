/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationHeaderType } from './constants';



// eslint-disable-next-line @typescript-eslint/naming-convention -- Preserve the public name and declaration merging.
export interface AbstractAuthorizationHeader {
    type: `${AuthorizationHeaderType}`
}



// eslint-disable-next-line @typescript-eslint/naming-convention -- Preserve the public name and declaration merging.
export interface BearerAuthorizationHeader extends AbstractAuthorizationHeader {
    type: 'Bearer',
    token: string
}



// eslint-disable-next-line @typescript-eslint/naming-convention -- Preserve the public name and declaration merging.
export interface BasicAuthorizationHeader extends AbstractAuthorizationHeader {
    type: 'Basic',
    username: string,
    password: string
}



// eslint-disable-next-line @typescript-eslint/naming-convention -- Preserve the public name and declaration merging.
export interface APIKeyAuthorizationHeader extends AbstractAuthorizationHeader {
    type: 'API-Key' | 'X-API-Key',
    key: string
}

export type AuthorizationHeader =    BasicAuthorizationHeader |
    BearerAuthorizationHeader |
    APIKeyAuthorizationHeader;
