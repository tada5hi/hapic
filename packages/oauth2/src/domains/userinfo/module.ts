/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationHeader, RequestBaseOptions } from 'hapic';
import { HeaderName, stringifyAuthorizationHeader } from 'hapic';
import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../types';
import type { UserInfoOptions } from './types';

export class UserInfoAPI extends BaseAPI {
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    // -----------------------------------------------------------------------------------

    /**
     * @throws Error
     * @param header
     * @param options
     */
    async get<T extends Record<string, any> = Record<string, any>>(
        header?: string | AuthorizationHeader,
        options: UserInfoOptions = {},
    ) : Promise<T> {
        const headers : Record<string, string> = { [HeaderName.ACCEPT]: 'application/json' };

        if (header) {
            if (typeof header === 'string') {
                if (!header.includes(' ')) {
                    headers.Authorization = `Bearer ${header}`;
                } else {
                    headers.Authorization = header;
                }
            } else {
                headers.Authorization = stringifyAuthorizationHeader(header);
            }
        }

        const requestOptions : RequestBaseOptions = { headers };

        if (options.signal) {
            requestOptions.signal = options.signal;
        }

        if (typeof options.timeout !== 'undefined') {
            requestOptions.timeout = options.timeout;
        }

        const { data } = await this.client.get(
            (this.options.userinfoEndpoint || '/userinfo'),
            requestOptions,
        );

        return data;
    }
}
