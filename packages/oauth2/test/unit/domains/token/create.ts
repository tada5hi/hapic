/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { createClient } from 'hapic';
import type { TokenGrantParameters, TokenGrantResponse } from '../../../../src';
import { TokenAPI } from '../../../../src';

const driver = createClient();
const postFn = jest.fn();

const tokenGrantResponse : TokenGrantResponse = {
    mac_key: 'mac_key',
    mac_algorithm: 'mac_algorithm',
    token_type: 'Bearer',
    expires_in: 3600,
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    id_token: 'id_token',
};

postFn.mockImplementation((
    _url: string,
    _data?: any,
    config?: RequestBaseOptions,
) => Promise.resolve({ data: tokenGrantResponse, request: { config } }));

driver.post = postFn;

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
            state: 'state',
        });

        expect(parameters).toEqual({
            grant_type: 'authorization_code',
            code: 'code',
            state: 'state',
            client_id: 'client',
            redirect_uri: redirectUri,
            client_secret: 'secret',
        } as TokenGrantParameters);
    });

    it('should get token', async () => {
        const api = new TokenAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/token',
                redirectUri,
                scope: ['email'],
            },
        });

        api.setClient(driver);

        let token = await api.createWithRefreshTokenGrant({ refresh_token: 'refresh_token' });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithClientCredentialsGrant();
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithPasswordGrant({ username: 'admin', password: 'start123' });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithAuthorizationCodeGrant({ state: 'state', code: 'code' });
        expect(token).toEqual({ ...tokenGrantResponse });

        token = await api.createWithRobotCredentialsGrant({ id: 'system', secret: 'start123' });
        expect(token).toEqual({ ...tokenGrantResponse });
    });

    it('should get token with non default path', async () => {
        const api = new TokenAPI({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/oauth/token',
                redirectUri,
                scope: ['email'],
            },
        });

        api.setClient(driver);

        const token = await api.createWithPasswordGrant({ username: 'admin', password: 'start123' });
        expect(token).toEqual({ ...tokenGrantResponse });
    });
});
