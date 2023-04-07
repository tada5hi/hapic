/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type { ConfigInput, Options } from './config';

import { AuthorizeAPI, TokenAPI, UserInfoAPI } from './domains';

export class Client extends BaseClient {
    override readonly '@instanceof' = Symbol.for('OAuth2Client');

    public options!: Options;

    public authorize: AuthorizeAPI;

    public token : TokenAPI;

    public userInfo : UserInfoAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        super(input);

        this.token = new TokenAPI({ driver: this.driver });
        this.authorize = new AuthorizeAPI({ driver: this.driver });
        this.userInfo = new UserInfoAPI({ driver: this.driver });

        this.setConfig(input);
    }

    // -----------------------------------------------------------------------------------

    override setConfig(input?: ConfigInput) {
        super.setConfig(input);

        input = input || {};

        if (!this.options || input.options) {
            this.options = input.options || {};
        }

        if (this.authorize) {
            this.authorize.setDriver(this.driver);
            this.authorize.setOptions(this.options);
        }

        if (this.token) {
            this.token.setDriver(this.driver);
            this.token.setOptions(this.options);
        }

        if (this.userInfo) {
            this.userInfo.setOptions(this.options);
            this.userInfo.setDriver(this.driver);
        }
    }
}
