/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from './constants';

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

// https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html#Combinations
export type ResponseTypeCombinations = `${ResponseType.CODE} ${ResponseType.TOKEN}` |
    `${ResponseType.CODE} ${ResponseType.ID_TOKEN}` |
    `${ResponseType.ID_TOKEN} ${ResponseType.TOKEN}` |
    `${ResponseType.CODE} ${ResponseType.ID_TOKEN} ${ResponseType.TOKEN}`;
