/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import type { TokenGrantParameters, TokenGrantResponse } from '../../../../src';
import { TokenAPI } from '../../../../src';

const tokenGrantResponse : TokenGrantResponse = {
    mac_key: 'mac_key',
    mac_algorithm: 'mac_algorithm',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token_expires_in: 7200,
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    id_token: 'id_token',
};

const redirectUri = 'https://example.com/redirect';

describe('src/domains/token', () => {
    it('should build token parameters', () => {
        const api = new TokenAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/token',
                redirectUri,
                scope: ['email'],
            },
        });

        let parameters : TokenGrantParameters = api.extendCreateParameters({
            grant_type: 'password',
            username: 'admin',
            password: 'start123',
        });

        expect(parameters).toEqual({
            grant_type: 'password',
            username: 'admin',
            password: 'start123',
            client_id: 'client',
            scope: ['email'],
            client_secret: 'secret',
        } as TokenGrantParameters);

        parameters = api.extendCreateParameters({
            grant_type: 'authorization_code',
            code: 'code',
        });

        expect(parameters).toEqual({
            grant_type: 'authorization_code',
            code: 'code',
            client_id: 'client',
            redirect_uri: redirectUri,
            client_secret: 'secret',
        } as TokenGrantParameters);
    });

    it('should get token', async () => {
        const transport = new MemoryTransport();
        transport.enqueue(
            ...Array.from({ length: 5 }, () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: tokenGrantResponse,
            })),
        );

        const api = new TokenAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/token',
                redirectUri,
                scope: ['email'],
            },
        });

        api.setClient(createClient({ transport }));

        let token = await api.createWithRefreshToken({
            refresh_token: 'refresh_token',
        });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithClientCredentials();
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithPassword({
            username: 'admin',
            password: 'start123',
        });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithAuthorizationCode({
            code: 'code',
        });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithRobotCredentials({
            id: 'system',
            secret: 'start123',
        });
        expect(token).toEqual({ ...tokenGrantResponse });

        // every grant flow posts (form-encoded) to the configured token endpoint
        expect(transport.requests).toHaveLength(5);
        transport.requests.forEach((request) => {
            expect(request.init.method).toBe('POST');
            expect(request.url).toBe('https://example.com/token');
        });

        const grantTypes = transport.requests.map(
            (request) => new URLSearchParams(request.init.body as any).get('grant_type'),
        );
        expect(grantTypes).toEqual([
            'refresh_token',
            'client_credentials',
            'password',
            'authorization_code',
            'robot_credentials',
        ]);
    });

    it('should get token with non default path', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: tokenGrantResponse,
        });

        const api = new TokenAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/oauth/token',
                redirectUri,
                scope: ['email'],
            },
        });

        api.setClient(createClient({ transport }));

        const token = await api.createWithPassword({ username: 'admin', password: 'start123' });
        expect(token).toEqual({ ...tokenGrantResponse });
        expect(transport.lastRequest!.url).toBe('https://example.com/oauth/token');
    });
});
