/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'hapic';
import type { ConfigInput, Options } from './config';

import { AuthorizeAPI, TokenAPI, UserInfoAPI } from './domains';

export class OAuth2Client extends Client {
    override readonly '@instanceof' = Symbol.for('OAuth2Client');

    public readonly options : Options;

    public authorize: AuthorizeAPI;

    public token : TokenAPI;

    public userInfo : UserInfoAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        input = input || {};

        super(input.request);

        const options = input.options || {};

        this.options = options;

        this.token = new TokenAPI({ client: this, options });
        this.authorize = new AuthorizeAPI({ client: this, options });
        this.userInfo = new UserInfoAPI({ client: this, options });
    }
}
