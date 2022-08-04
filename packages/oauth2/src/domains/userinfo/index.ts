/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, ClientDriverInstance } from 'hapic';
import { ClientOptions } from '../../type';
import { BaseOAuth2API } from '../base';

export class UserinfoAPI extends BaseOAuth2API {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(
        client: Client | ClientDriverInstance,
        options?: ClientOptions,
    ) {
        super(client, options);
    }

    // -----------------------------------------------------------------------------------

    /**
     * @throws Error
     * @param token
     */
    async get<T extends Record<string, any>>(token: string) : Promise<T> {
        const { data } = await this.client.get(
            (this.options.userinfo_endpoint || '/userinfo'),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return data;
    }
}
