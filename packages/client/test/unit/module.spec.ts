/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client, 
    HeaderName, 
    HookName,
    MemoryTransport,
} from '../../src';

describe('src/module', () => {
    it('should export its current configuration as client options', async () => {
        const transport = new MemoryTransport();
        const client = new Client({
            baseURL: 'https://example.com/',
            headers: { 'x-initial': '1', 'x-removed': '1' },
            transport,
        });

        client.setHeader('x-tenant', 'acme');
        client.unsetHeader('x-removed');
        client.setBaseURL('https://api.example.com/');

        const options = client.toOptions();

        expect(options.transport).toBe(transport);
        expect(options.baseURL).toBe('https://api.example.com/');

        const copy = new Client(options);

        expect(copy.getBaseURL()).toBe('https://api.example.com/');
        expect(copy.getHeader('x-initial')).toBe('1');
        expect(copy.getHeader('x-tenant')).toBe('acme');
        expect(copy.getHeader('x-removed')).toBeNull();

        await copy.get('foo');

        expect(transport.requests.at(-1)!.url).toBe('https://api.example.com/foo');
    });

    it('should export options detached from the client', () => {
        const client = new Client({ baseURL: 'https://example.com/' });

        client.setHeader('x-tenant', 'acme');

        const options = client.toOptions();
        const copy = new Client(options);

        copy.setHeader('x-tenant', 'other');
        copy.setBaseURL('https://other.example.com/');

        expect(client.getHeader('x-tenant')).toBe('acme');
        expect(client.getBaseURL()).toBe('https://example.com/');
        expect(new Headers(options.headers).get('x-tenant')).toBe('acme');
    });

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
        const client = new Client({ baseURL: 'http://localhost:3000/' });

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
