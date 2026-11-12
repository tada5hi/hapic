/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import type { OpenIDProviderMetadata } from '../../src';
import { buildOpenIDDiscoveryURL, createClientWithOpenIDDiscoveryURL } from '../../src';

const metadata : OpenIDProviderMetadata = {
    authorization_endpoint: 'http://localhost:3000/auhtorize',
    id_token_signing_alg_values_supported: [
        'RS256',
    ],
    introspection_endpoint: 'http://localhost:3000/introspect',
    issuer: 'api',
    jwks_uri: 'http://localhost:3000/jwks',
    registration_endpoint: 'http://localhost:3000/register',
    response_type_supported: [
        'token',
        'id_token token',
    ],
    revocation_endpoint: 'http://localhost:3000/token',
    service_documentation: 'http://localhost:3000/docs',
    subject_types_supported: [],
    token_endpoint: 'http://localhost:3000/token',
    userinfo_endpoint: 'http://localhost:3000/userinfo',
};

function createMetadataTransport() {
    return new MemoryTransport({
        fetch: (request) => {
            if (request.url.endsWith('/.well-known/openid-configuration')) {
                return {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                    body: metadata,
                };
            }

            return {
                status: 200,
                body: { access_token: 'token', token_type: 'Bearer' },
            };
        },
    });
}

describe('src/open-id', () => {
    it('should build open id discovery url', () => {
        let url = buildOpenIDDiscoveryURL('http://localhost:3002');

        expect(url).toEqual('http://localhost:3002/.well-known/openid-configuration');

        url = buildOpenIDDiscoveryURL('https://example.com/api/');
        expect(url).toEqual('https://example.com/api/.well-known/openid-configuration');

        url = buildOpenIDDiscoveryURL();
        expect(url).toEqual('/.well-known/openid-configuration');
    });

    it('should create client by open-id endpoint', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: metadata,
            }),
        });

        const driver = createClient({ transport });

        const url = buildOpenIDDiscoveryURL();
        const client = await createClientWithOpenIDDiscoveryURL(url, driver);

        expect(client.options.authorizationEndpoint).toEqual('http://localhost:3000/auhtorize');
        expect(client.options.tokenEndpoint).toEqual('http://localhost:3000/token');
        expect(client.options.userinfoEndpoint).toEqual('http://localhost:3000/userinfo');

        expect(transport.requests.at(-1)!.url).toBe('/.well-known/openid-configuration');
    });

    it('should keep the authorization header set on the passed client after construction', async () => {
        const transport = createMetadataTransport();

        const driver = createClient({ transport });

        driver.setAuthorizationHeader({ type: 'Bearer', token: 'secret' });

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), driver);

        expect(client.getAuthorizationHeader()).toBe('Bearer secret');
    });

    it('should keep an authorization header set via setHeader on the passed client', async () => {
        const driver = createClient({ transport: createMetadataTransport() });

        driver.setHeader('Authorization', 'Basic Zm9vOmJhcg==');

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), driver);

        expect(client.getAuthorizationHeader()).toBe('Basic Zm9vOmJhcg==');
    });

    it('should keep the transport passed with plain options', async () => {
        const transport = createMetadataTransport();

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), {
            transport,
            headers: { 'x-tenant': 'acme' },
        });

        expect(client.options.tokenEndpoint).toEqual('http://localhost:3000/token');

        await client.token.createWithClientCredentials({
            client_id: 'client',
            client_secret: 'secret',
        });

        const req = transport.requests.at(-1)!;

        expect(req.url).toBe('http://localhost:3000/token');
        expect(new Headers(req.headers).get('x-tenant')).toBe('acme');
    });
});
