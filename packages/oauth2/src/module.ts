/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import { Client as BaseClient } from 'hapic';
import type {
    ConfigInput,
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

    constructor(input?: ConfigInput) {
        super(input);

        input = input || {};

        this.options = input.options || {};

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
    setDriver(driver: Driver) {
        super.setConfig({ driver });

        this.authorize.setDriver(driver);
        this.token.setDriver(driver);
        this.userInfo.setDriver(driver);
    }

    setOptions(options: Options) {
        this.options = options;

        this.authorize.setOptions(options);
        this.token.setOptions(options);
        this.userInfo.setOptions(options);
    }
}
