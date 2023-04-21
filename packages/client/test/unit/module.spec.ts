/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client, HeaderName, HookName,
} from '../../src';

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
        expect(client.getAuthorizationHeader()).toEqual('Bearer foo');

        client.unsetAuthorizationHeader();
        expect(client.getAuthorizationHeader()).toBeFalsy();
    });

    it('should get baseURL', () => {
        const client = new Client({
            baseURL: 'http://localhost:3000/',
        });

        expect(client.getBaseURL()).toEqual('http://localhost:3000/');
    });

    it('should mount/unmount request hook', () => {
        const client = new Client();

        const hookId = client.on(
            HookName.REQUEST,
            (options) => {
                options.transform = (data, headers) => {
                    headers.set(HeaderName.AUTHORIZATION, 'Bearer foo');

                    return data;
                };

                return options;
            },
        );

        expect(hookId).toBeDefined();

        client.off(HookName.REQUEST, hookId);
        client.off(HookName.REQUEST);
    });

    it('should mount/unmount response hook', () => {
        const client = new Client();

        const hookId = client.on(
            HookName.RESPONSE,
            (res) => {
                res.data = 'foo';

                return res;
            },
        );

        expect(hookId).toBeDefined();

        client.off(HookName.RESPONSE, hookId);
        client.off(HookName.RESPONSE);
    });

    it('should mount/unmount error hook', () => {
        const client = new Client();

        const interceptorId = client.on(
            HookName.REQUEST_ERROR,
            (error) => {
                throw error;
            },
        );

        expect(interceptorId).toBeDefined();

        client.off(HookName.REQUEST_ERROR, interceptorId);
        client.off(HookName.REQUEST_ERROR);
    });
});
