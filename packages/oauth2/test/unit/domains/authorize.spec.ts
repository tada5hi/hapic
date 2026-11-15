/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AuthorizeAPI, buildAuthorizeURL } from '../../../src';
import type { AuthorizeParameters } from '../../../src';

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

        let url = api.buildURL({ redirect_uri: redirectUri });

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

        expect(url).toEqual(`https://example.com/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}&scope=address`);
    });

    it('should build authorize url by base client url', () => {
        const api = new AuthorizeAPI({ client: { baseURL: 'http://localhost:3000' } });

        const url = api.buildURL();

        expect(url).toEqual('http://localhost:3000/authorize?response_type=code');
    });

    it('should buil authorize url with baseURL (suffix)', () => {
        const api = new AuthorizeAPI({ client: { baseURL: 'http://localhost:3000/auth/' } });

        const url = api.buildURL();

        expect(url).toEqual('http://localhost:3000/auth/authorize?response_type=code');
    });

    it('should build authorize url with non default authorize path', () => {
        const api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/oauth2/authorize',
                clientId: 'client',
            },
        });

        const url = api.buildURL({ redirect_uri: redirectUri });

        expect(url).toEqual(`https://example.com/oauth2/authorize?response_type=code&client_id=client&redirect_uri=${encodeURIComponent(redirectUri)}`);
    });

    it('should build authorize url with OIDC parameters', () => {
        const api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
            },
        });

        const url = api.buildURL({
            acr_values: ['urn:mace:incommon:iap:silver', 'urn:mace:incommon:iap:bronze'],
            login_hint: 'user@example.com',
            id_token_hint: 'token',
            ui_locales: ['de-DE', 'en'],
            max_age: 0,
            prompt: ['login', 'consent'],
            display: 'popup',
            nonce: 'n-0S6_WzA2Mj',
            state: 'state',
            scope: 'openid',
        });

        const expected = new URL('https://example.com/authorize');

        expected.searchParams.set('response_type', 'code');
        expected.searchParams.set('client_id', 'client');
        expected.searchParams.set('scope', 'openid');
        expected.searchParams.set('state', 'state');
        expected.searchParams.set('nonce', 'n-0S6_WzA2Mj');
        expected.searchParams.set('display', 'popup');
        expected.searchParams.set('prompt', 'login consent');
        expected.searchParams.set('max_age', '0');
        expected.searchParams.set('ui_locales', 'de-DE en');
        expected.searchParams.set('id_token_hint', 'token');
        expected.searchParams.set('login_hint', 'user@example.com');
        expected.searchParams.set('acr_values', 'urn:mace:incommon:iap:silver urn:mace:incommon:iap:bronze');

        expect(url).toEqual(expected.href);
    });

    it('should build authorize url with single string OIDC parameters', () => {
        const url = buildAuthorizeURL('https://example.com/authorize', {
            prompt: 'none',
            acr_values: 'loa-2',
            ui_locales: 'de',
            max_age: '3600',
        });

        expect(url).toEqual('https://example.com/authorize?response_type=code&prompt=none&max_age=3600&ui_locales=de&acr_values=loa-2');
    });

    it('should pass through additional parameters in input order', () => {
        const api = new AuthorizeAPI({
            options: {
                authorizationEndpoint: 'https://example.com/authorize',
                clientId: 'client',
            },
        });

        const url = api.buildURL({
            foo: 'bar',
            audience: 'https://api.example.com',
            nonce: 'abc',
            resource: ['a', 'b'],
            count: 5,
        });

        const expected = new URL('https://example.com/authorize');

        expected.searchParams.set('response_type', 'code');
        expected.searchParams.set('client_id', 'client');
        expected.searchParams.set('nonce', 'abc');
        expected.searchParams.set('foo', 'bar');
        expected.searchParams.set('audience', 'https://api.example.com');
        expected.searchParams.append('resource', 'a');
        expected.searchParams.append('resource', 'b');
        expected.searchParams.set('count', '5');

        expect(url).toEqual(expected.href);
    });

    it('should never emit credentials of the token request', () => {
        const parameters = {
            client_id: 'client',
            client_secret: 'secret',
            code_verifier: 'verifier',
            password: 'password',
            refresh_token: 'refresh',
            client_assertion: 'assertion',
            audience: 'https://api.example.com',
        };

        const url = new URL(buildAuthorizeURL('https://example.com/authorize', parameters));

        expect(Array.from(url.searchParams.keys()).sort()).toEqual(['audience', 'client_id', 'response_type']);
    });

    it('should replace a custom parameter already present on the endpoint', () => {
        const url = new URL(buildAuthorizeURL('https://example.com/authorize?audience=old&p=b2c', {
            client_id: 'client',
            audience: 'new',
            resource: ['a', 'b'],
        }));

        expect(url.searchParams.getAll('audience')).toEqual(['new']);
        expect(url.searchParams.getAll('resource')).toEqual(['a', 'b']);
        expect(url.searchParams.get('p')).toBe('b2c');
    });

    it('should keep an endpoint parameter when the custom value is empty', () => {
        const url = new URL(buildAuthorizeURL('https://example.com/authorize?audience=old', {
            client_id: 'client',
            audience: '',
        }));

        expect(url.searchParams.getAll('audience')).toEqual(['old']);
    });

    it('should skip empty and ignore unsupported parameter values', () => {
        const parameters = {
            nonce: '',
            login_hint: undefined,
            empty: '',
            missing: undefined,
            nothing: null,
            claims: { userinfo: { email: null } },
            flag: true,
            foo: 'bar',
        } as unknown as AuthorizeParameters;

        const url = buildAuthorizeURL('https://example.com/authorize', parameters);

        expect(url).toEqual('https://example.com/authorize?response_type=code&foo=bar');
    });

    it('should keep known parameters strictly typed', () => {
        const parameters : AuthorizeParameters = { foo: 'bar', max_age: 10 };

        // @ts-expect-error scope must be a string or string[]
        parameters.scope = 5;
        // @ts-expect-error prompt must be a known prompt value
        parameters.prompt = 'foo';
        // @ts-expect-error display must be a known display value
        parameters.display = 'tv';
        // @ts-expect-error additional parameters must be string, number or string[]
        parameters.claims = { userinfo: {} };

        expect(parameters.foo).toEqual('bar');
    });
});
