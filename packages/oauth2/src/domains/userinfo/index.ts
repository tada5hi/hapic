/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationHeader } from 'hapic';
import { stringifyAuthorizationHeader } from 'hapic';
import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../type';

export class UserInfoAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    // -----------------------------------------------------------------------------------

    /**
     * @throws Error
     * @param header
     */
    async get<T extends Record<string, any> = Record<string, any>>(
        header?: string | AuthorizationHeader,
    ) : Promise<T> {
        const headers : Record<string, string> = {};
        if (header) {
            if (typeof header === 'string') {
                if (header.indexOf(' ') === -1) {
                    headers.Authorization = `Bearer ${header}`;
                } else {
                    headers.Authorization = header;
                }
            } else {
                headers.Authorization = stringifyAuthorizationHeader(header);
            }
        }

        const { data } = await this.client.get(
            (this.options.userinfoEndpoint || '/userinfo'),
            {
                headers,
            },
        );

        return data;
    }
}
