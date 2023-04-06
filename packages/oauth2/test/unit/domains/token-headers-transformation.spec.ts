/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers, stringifyAuthorizationHeader } from 'hapic';
import { TokenAPI } from '../../../src';

describe('src/domains/token', () => {
    it('should use inherited header over client credentials', () => {
        const headers = new ClientDriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Bearer',
            token: 'foo',
        }));
    });

    it('should use inherited header over header by option', () => {
        const headers = new ClientDriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, {
            authorizationHeader: {
                type: 'Basic',
                username: 'admin',
                password: 'start123',
            },
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Bearer',
            token: 'foo',
        }));
    });

    it('should use client-credentials for header', () => {
        const headers = new ClientDriverHeaders();

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        }));
    });

    it('should use client-credentials for header', () => {
        const headers = new ClientDriverHeaders();

        const tokenAPI = new TokenAPI({
            options: {
                clientId: 'admin',
                clientSecret: 'start123',
            },
        });

        tokenAPI.transformHeadersForRequest(headers, {
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        }));
    });

    it('should not use client-credentials for header', () => {
        const headers = new ClientDriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should use options authorization header', () => {
        const headers = new ClientDriverHeaders();

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, { authorizationHeader: 'Bearer foo' });
        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should not use options authorization header', () => {
        const headers = new ClientDriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        const tokenAPI = new TokenAPI();
        tokenAPI.transformHeadersForRequest(headers, {
            authorizationHeader: {
                type: 'Basic',
                username: 'admin',
                password: 'start123',
            },
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });
});
