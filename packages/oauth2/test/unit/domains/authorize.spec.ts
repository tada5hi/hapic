/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AuthorizeAPI } from '../../../src';

const redirectUri = 'https://example.com/redirect';

describe('src/domains/authorize', () => {
    it('should build authorize url', () => {
        // redirect uri in method
        let api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
            },
        });

        let url = api.buildURL({
            redirect_uri: redirectUri,
        });

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);

        // redirect uri in constructor
        api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
                redirectUri,
            },
        });

        url = api.buildURL();

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);

        api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
                redirectUri,
                scope: ['email'],
            },
        });

        url = api.buildURL();

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email`);

        url = api.buildURL({ scope: 'address' });

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email+address`);
    });

    it('should build authorize url by base client url', () => {
        const api = new AuthorizeAPI({
            driver: {
                baseURL: 'http://localhost:3000',
            },
        });

        const url = api.buildURL();
        expect(url).toEqual('http://localhost:3000/authorize?response_type=code');
    });

    it('should build authorize url with non default authorize path', () => {
        const api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/oauth2/authorize',
                clientId: 'client',
            },
        });

        const url = api.buildURL({
            redirect_uri: redirectUri,
        });

        expect(url).toEqual(`https://example.com/oauth2/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);
    });
});
