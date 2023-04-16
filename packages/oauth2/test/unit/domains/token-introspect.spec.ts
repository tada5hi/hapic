/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from 'hapic';
import {
    createClient,
} from 'hapic';
import { TokenAPI } from '../../../src';
import type { JwtPayload } from '../../../src';

const driver = createClient();
const postFn = jest.fn();

const payload : JwtPayload = {
    active: true,
    permissions: [],
    kind: 'access_token',
    jti: '58b4ce4b-42bc-4ff2-9b55-32d9a14d77f0',
    sub: 'd4bd68d9-8600-4388-b083-7481901dd2fd',
    sub_kind: 'user',
    remote_address: '127.0.0.1',
    realm_id: 'e0aefc0c-3396-471e-ab81-f84779978223',
    realm_name: 'master',
    scope: 'global',
    name: 'admin',
    family_name: null,
    given_name: null,
    nickname: 'admin',
    preferred_username: 'admin',
    email: 'peter.placzek1996@gmail.com',
    email_verified: true,
};

postFn.mockImplementation((
    _url: string,
    _data?: any,
    config?: RequestOptions,
) => Promise.resolve({ data: payload, request: { config } }));

driver.post = postFn;

describe('src/domains/token', () => {
    it('should introspect token', async () => {
        const tokenAPI = new TokenAPI({ client: driver });

        const response = await tokenAPI.introspect({ token: 'foo' });
        expect(response).toEqual(payload);
    });
});
