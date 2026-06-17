/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { UserInfoAPI } from '../../../src';

const userInfoResponse : Record<string, any> = {
    name: 'admin',
    email: 'admin@example.com',
};

describe('src/domains/userinfo', () => {
    it('should get user info', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: userInfoResponse,
        });

        const api = new UserInfoAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userinfoEndpoint: 'https://example.com/userinfo',
            },
        });

        api.setClient(createClient({ transport }));

        const userInfo = await api.get('token');
        expect(userInfo).toEqual(userInfoResponse);

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('GET');
        expect(request.url).toBe('https://example.com/userinfo');
        expect((request.init.headers as Headers).get('authorization')).toBe('Bearer token');
    });

    it('should get user info with non default path', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: userInfoResponse,
        });

        const api = new UserInfoAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userinfoEndpoint: 'https://example.com/users/@me',
            },
        });

        api.setClient(createClient({ transport }));

        const userInfo = await api.get('token');
        expect(userInfo).toEqual(userInfoResponse);
        expect(transport.lastRequest!.url).toBe('https://example.com/users/@me');
    });
});
