/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DriverHeaders, stringifyAuthorizationHeader } from 'hapic';
import { transformHeadersForTokenAPIRequest } from '../../../../src/domains/token/utils';

describe('src/domains/token', () => {
    it('should hold inherited header', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should use options authorization header', () => {
        const headers = new DriverHeaders();

        transformHeadersForTokenAPIRequest(headers, { authorizationHeader: 'Bearer foo' });
        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should use inherited header over header by option', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
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

    it('should use header by option over inherited', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
            authorizationHeader: {
                type: 'Basic',
                username: 'admin',
                password: 'start123',
            },
            authorizationHeaderInherit: false,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        }));
    });

    it('should use client-credentials for header', () => {
        const headers = new DriverHeaders();

        transformHeadersForTokenAPIRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            clientCredentialsAsHeader: true,
        });

        expect(headers.get('Authorization')).toEqual(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        }));
    });

    it('should not use client-credentials for header', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            clientCredentialsAsHeader: true,
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should not use options authorization header', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
            authorizationHeader: {
                type: 'Basic',
                username: 'admin',
                password: 'start123',
            },
            authorizationHeaderInherit: true,
        });

        expect(headers.get('Authorization')).toEqual('Bearer foo');
    });

    it('should not set header', () => {
        const headers = new DriverHeaders();
        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
        });

        expect(headers.has('Authorization')).toBeFalsy();

        headers.set('Authorization', 'Bearer foo');
        transformHeadersForTokenAPIRequest(headers, {
            clientId: 'admin',
            clientSecret: 'start123',
            clientCredentialsAsHeader: false,
        });

        expect(headers.has('Authorization')).toBeFalsy();
    });
});
