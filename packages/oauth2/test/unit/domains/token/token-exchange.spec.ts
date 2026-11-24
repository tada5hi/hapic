/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import type { TokenGrantParameters } from '../../../../src';
import {
    TokenAPI,
    TokenTypeIdentifier,
    buildURLSearchParamsForTokenAPIRequest,
} from '../../../../src';

function createAPI(options: Record<string, any> = {}) {
    const transport = new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {
                access_token: 'exchanged',
                token_type: 'Bearer',
                expires_in: 300,
                issued_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            },
        }),
    });

    const api = new TokenAPI({
        options: {
            clientId: 'client',
            clientSecret: 'secret',
            tokenEndpoint: 'https://example.com/token',
            ...options,
        },
    });

    api.setClient(createClient({ transport }));

    return { api, transport };
}

function readBody(transport: MemoryTransport) : URLSearchParams {
    return new URLSearchParams(transport.requests.at(-1)!.body as any);
}

describe('src/domains/token (token exchange, RFC 8693)', () => {
    it('should export the token type identifiers (RFC 8693 3)', () => {
        expect(TokenTypeIdentifier.ACCESS_TOKEN).toBe('urn:ietf:params:oauth:token-type:access_token');
        expect(TokenTypeIdentifier.REFRESH_TOKEN).toBe('urn:ietf:params:oauth:token-type:refresh_token');
        expect(TokenTypeIdentifier.ID_TOKEN).toBe('urn:ietf:params:oauth:token-type:id_token');
        expect(TokenTypeIdentifier.SAML1).toBe('urn:ietf:params:oauth:token-type:saml1');
        expect(TokenTypeIdentifier.SAML2).toBe('urn:ietf:params:oauth:token-type:saml2');
        expect(TokenTypeIdentifier.JWT).toBe('urn:ietf:params:oauth:token-type:jwt');
    });

    it('should keep the exchange grant type over an extension parameter', async () => {
        const { api, transport } = createAPI();

        await api.createWithTokenExchange<{ grant_type: string }>({
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            grant_type: 'client_credentials',
        });

        expect(readBody(transport).get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:token-exchange');
    });

    it('should post the token exchange grant', async () => {
        const { api, transport } = createAPI();

        const token = await api.createWithTokenExchange({
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            actor_token: 'actor',
            actor_token_type: TokenTypeIdentifier.JWT,
            requested_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            audience: 'https://api.example.com',
            resource: 'https://resource.example.com',
            scope: ['read', 'write'],
        });

        expect(token).toEqual({
            access_token: 'exchanged',
            token_type: 'Bearer',
            expires_in: 300,
            issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('https://example.com/token');

        const body = readBody(transport);

        expect(Object.fromEntries(body.entries())).toEqual({
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            subject_token: 'subject',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: 'actor',
            actor_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            audience: 'https://api.example.com',
            resource: 'https://resource.example.com',
            scope: 'read write',
            client_id: 'client',
            client_secret: 'secret',
        });
    });

    it('should repeat audience and resource for every array item (RFC 8693 2.1)', async () => {
        const { api, transport } = createAPI();

        await api.createWithTokenExchange({
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            audience: ['a', 'b'],
            resource: ['https://r1.example.com', 'https://r2.example.com'],
        });

        const body = readBody(transport);

        expect(body.getAll('audience')).toEqual(['a', 'b']);
        expect(body.getAll('resource')).toEqual(['https://r1.example.com', 'https://r2.example.com']);
    });

    it('should not fill the default scope of the client options', async () => {
        const { api, transport } = createAPI({ scope: ['email'] });

        await api.createWithTokenExchange({
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
        });

        expect(readBody(transport).has('scope')).toBe(false);
    });

    it('should send extension parameters', async () => {
        const { api, transport } = createAPI();

        // e.g. Authup: space separated capabilities and a requested lifetime
        await api.createWithTokenExchange({
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ACCESS_TOKEN,
            audience: 'hub',
            cap: ['project:read', 'node:read'],
            expires_in: 60,
            offline: false,
            realm_id: 'realm',
        }, { timeout: 1_000 });

        const body = readBody(transport);

        expect(body.get('cap')).toBe('project:read node:read');
        expect(body.get('expires_in')).toBe('60');
        expect(body.get('offline')).toBe('false');
        expect(body.get('realm_id')).toBe('realm');
    });

    it('should accept the token exchange grant in create()', async () => {
        const { api, transport } = createAPI();

        const parameters : TokenGrantParameters = {
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            subject_token: 'subject',
            subject_token_type: TokenTypeIdentifier.ID_TOKEN,
        };

        await api.create(parameters);

        expect(readBody(transport).get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:token-exchange');
    });

    it('should keep joining other arrays with spaces', () => {
        const body = buildURLSearchParamsForTokenAPIRequest({
            scope: ['a', '', 'b'],
            audience: ['x', '', 'y'],
            resource: [],
        });

        expect(body.getAll('scope')).toEqual(['a b']);
        expect(body.getAll('audience')).toEqual(['x', 'y']);
        expect(body.has('resource')).toBe(false);
    });
});
