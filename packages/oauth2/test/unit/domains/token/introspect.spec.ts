/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { TokenAPI } from '../../../../src';
import type { JwtPayload } from '../../../../src';

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

describe('src/domains/token', () => {
    it('should introspect token', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: payload,
        });

        const tokenAPI = new TokenAPI({ client: createClient({ transport }) });

        const response = await tokenAPI.introspect({ token: 'foo' });
        expect(response).toEqual(payload);

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('POST');
        expect(request.url).toBe('/token/introspect');
    });
});
