/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { UserInfoAPI } from '../../../src';

const getFn = jest.fn();

const userInfoResponse : Record<string, any> = {
    name: 'admin',
    email: 'admin@example.com',
};

getFn.mockResolvedValue({ data: userInfoResponse });

const client = createClient();
client.get = getFn;

describe('src/domains/userinfo', () => {
    it('should get user info', async () => {
        const api = new UserInfoAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userinfoEndpoint: 'https://example.com/userinfo',
            },
        });

        api.setClient(client);

        const userInfo = await api.get('token');
        expect(userInfo).toEqual(userInfoResponse);
    });

    it('should get user info with non default path', async () => {
        const api = new UserInfoAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userinfoEndpoint: 'https://example.com/users/@me',
            },
        });

        api.setClient(client);

        const userInfo = await api.get('token');
        expect(userInfo).toEqual(userInfoResponse);
    });
});
