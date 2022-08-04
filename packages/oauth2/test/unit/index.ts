/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { OAuth2Client, TokenGrantParameters, TokenGrantResponse } from '../../src';

const postFn = jest.fn();
const getFn = jest.fn();

const oauth2TokenResponse : TokenGrantResponse = {
    mac_key: 'mac_key',
    mac_algorithm: 'mac_algorithm',
    token_type: 'Bearer',
    expires_in: 3600,
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    id_token: 'id_token',
};

const userInfoResponse : Record<string, any> = {
    name: 'admin',
    email: 'admin@example.com',
};

postFn.mockResolvedValue({ data: oauth2TokenResponse });
getFn.mockResolvedValue({ data: userInfoResponse });

const redirectUri = 'https://example.com/redirect';

const client = createClient();
client.driver.post = postFn;
client.driver.get = getFn;

describe('src/protocols/oauth2/client/index.ts', () => {
    it('should build authorize url', () => {
        // redirect uri in method
        let oauth2Client = new OAuth2Client({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
            },
        });

        let url = oauth2Client.authorize.buildURL({
            redirect_uri: redirectUri,
        });

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);

        // redirect uri in constructor
        oauth2Client = new OAuth2Client({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
                redirectUri,
            },
        });

        url = oauth2Client.authorize.buildURL();

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);

        oauth2Client = new OAuth2Client({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
                redirectUri,
                scope: ['email'],
            },
        });

        url = oauth2Client.authorize.buildURL();

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email`);

        url = oauth2Client.authorize.buildURL({ scope: 'address' });

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}&scope=address`);
    });

    it('should build authorize url with non default authorize path', () => {
        const oauth2Client = new OAuth2Client({
            options: {
                authorizationEndpoint: 'https://example.com/oauth2/authorize',
                clientId: 'client',
            },
        });

        const url = oauth2Client.authorize.buildURL({
            redirect_uri: redirectUri,
        });

        expect(url).toEqual(`https://example.com/oauth2/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);
    });

    it('should build token parameters', () => {
        const oauth2Client = new OAuth2Client({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/token',
                redirectUri,
                scope: ['email'],
            },
        });

        let parameters : TokenGrantParameters = oauth2Client.token.buildTokenParameters({
            grant_type: 'password',
            username: 'admin',
            password: 'start123',
        });

        expect(parameters).toEqual({
            grant_type: 'password',
            username: 'admin',
            password: 'start123',
            client_id: 'client',
            scope: 'email',
            client_secret: 'secret',
        } as TokenGrantParameters);

        parameters = oauth2Client.token.buildTokenParameters({
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
        const oauth2Client = new OAuth2Client({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/token',
                redirectUri,
                scope: ['email'],
            },
        });

        oauth2Client.setDriver(client.driver);

        let token = await oauth2Client.token.createWithRefreshToken({ refresh_token: 'refresh_token' });
        expect(token).toEqual({ ...oauth2TokenResponse });

        token = await oauth2Client.token.createWithClientCredentials({});
        expect(token).toEqual({ ...oauth2TokenResponse });

        token = await oauth2Client.token.createWithPasswordGrant({ username: 'admin', password: 'start123' });
        expect(token).toEqual({ ...oauth2TokenResponse });

        token = await oauth2Client.token.createWithAuthorizeGrant({ state: 'state', code: 'code' });
        expect(token).toEqual({ ...oauth2TokenResponse });
    });

    it('should get token with non default path', async () => {
        const oauth2Client = new OAuth2Client({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                tokenEndpoint: 'https://example.com/oauth/token',
                redirectUri,
                scope: ['email'],
            },
        });

        oauth2Client.setDriver(client.driver);

        const token = await oauth2Client.token.createWithPasswordGrant({ username: 'admin', password: 'start123' });
        expect(token).toEqual({ ...oauth2TokenResponse });
    });

    it('should get user info', async () => {
        const oauth2Client = new OAuth2Client({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userInfoEndpoint: 'https://example.com/userinfo',
            },
        });

        oauth2Client.setDriver(client.driver);

        const userInfo = await oauth2Client.userInfo.get('token');
        expect(userInfo).toEqual(userInfoResponse);
    });

    it('should get user info with non default path', async () => {
        const oauth2Client = new OAuth2Client({
            options: {
                clientId: 'client',
                clientSecret: 'secret',
                userInfoEndpoint: 'https://example.com/userinfo',
            },
        });

        oauth2Client.setDriver(client.driver);

        const userInfo = await oauth2Client.userInfo.get('token');
        expect(userInfo).toEqual(userInfoResponse);
    });
});
