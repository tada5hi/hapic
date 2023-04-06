/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientDriverInstance } from 'hapic';
import { Client as BaseClient } from 'hapic';
import type {
    Config,
    Options,
} from './type';

import { AuthorizeAPI, TokenAPI, UserInfoAPI } from './domains';

export class Client extends BaseClient {
    override readonly '@instanceof' = Symbol.for('OAuth2Client');

    public options : Options;

    public authorize: AuthorizeAPI;

    public token : TokenAPI;

    public userInfo : UserInfoAPI;

    // -----------------------------------------------------------------------------------

    constructor(config?: Config) {
        super(config);

        config = config || {};
        this.options = config.options || {};

        this.token = new TokenAPI({
            driver: this.driver,
            options: this.options,
        });

        this.authorize = new AuthorizeAPI({
            driver: this.driver,
            options: this.options,
        });

        this.userInfo = new UserInfoAPI({
            driver: this.driver,
            options: this.options,
        });
    }

    // -----------------------------------------------------------------------------------

    /* istanbul ignore next */
    override setDriver(client: ClientDriverInstance) {
        super.setDriver(client);

        this.authorize.setDriver(client);
        this.token.setDriver(client);
        this.userInfo.setDriver(client);
    }
}
