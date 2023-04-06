/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, HeaderName } from '../../src';

describe('src/module', () => {
    it('should set/unset header', () => {
        const client = new Client();

        expect(client.getHeader(HeaderName.AUTHORIZATION)).toBeFalsy();

        client.setHeader(HeaderName.AUTHORIZATION, 'foo');
        expect(client.getHeader(HeaderName.AUTHORIZATION)).toEqual('foo');

        client.unsetHeader(HeaderName.AUTHORIZATION);
        expect(client.getHeader(HeaderName.AUTHORIZATION)).toBeFalsy();

        client.setHeader(HeaderName.AUTHORIZATION, 'bar');
        client.unsetHeaders();

        expect(client.getHeader(HeaderName.AUTHORIZATION)).toBeFalsy();
    });

    it('should set/unset authorization header', () => {
        const client = new Client();

        client.setAuthorizationHeader({
            type: 'Bearer',
            token: 'foo',
        });
        expect(client.getHeader(HeaderName.AUTHORIZATION)).toEqual('Bearer foo');

        client.unsetAuthorizationHeader();
        expect(client.getHeader(HeaderName.AUTHORIZATION)).toBeFalsy();
    });

    it('should get baseURL', () => {
        const client = new Client({
            driver: {
                baseURL: 'http://localhost:3000/',
            },
        });

        expect(client.getBaseURL()).toEqual('http://localhost:3000/');
    });

    it('should mount/unmount response interceptor', () => {
        const client = new Client();

        const interceptorId = client.mountResponseInterceptor(
            (value) => value,
            (err) => { throw err; },
        );

        expect(interceptorId).toBeDefined();

        client.unmountResponseInterceptor(interceptorId);
        client.unmountResponseInterceptors();
    });

    it('should mount/unmount request interceptor', () => {
        const client = new Client();

        const interceptorId = client.mountRequestInterceptor(
            (value) => value,
            (err) => { throw err; },
        );

        expect(interceptorId).toBeDefined();

        client.unmountRequestInterceptor(interceptorId);
        client.unmountRequestInterceptors();
    });
});
