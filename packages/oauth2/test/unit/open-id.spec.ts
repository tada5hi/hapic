/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HookName, MemoryTransport, createClient } from 'hapic';
import type { OpenIDProviderMetadata } from '../../src';
import {
    buildOpenIDDiscoveryURL,
    createClientWithOpenIDDiscoveryURL,
    parseOpenIDProviderMetadata,
} from '../../src';

const metadata : OpenIDProviderMetadata = {
    authorization_endpoint: 'http://localhost:3000/auhtorize',
    device_authorization_endpoint: 'http://localhost:3000/device_authorization',
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

    it('should parse the provider metadata', () => {
        expect(parseOpenIDProviderMetadata(metadata)).toEqual({
            authorizationEndpoint: 'http://localhost:3000/auhtorize',
            deviceAuthorizationEndpoint: 'http://localhost:3000/device_authorization',
            introspectionEndpoint: 'http://localhost:3000/introspect',
            revocationEndpoint: 'http://localhost:3000/token',
            tokenEndpoint: 'http://localhost:3000/token',
            userinfoEndpoint: 'http://localhost:3000/userinfo',
        });
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

    it('should keep the transport and headers of the passed client', async () => {
        const transport = createMetadataTransport();
        const driver = createClient({ transport, headers: { 'x-removed': '1' } });

        driver.setHeader('x-tenant', 'acme');
        driver.unsetHeader('x-removed');

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), driver);

        await client.token.createWithClientCredentials({
            client_id: 'client',
            client_secret: 'secret',
        });

        const req = transport.requests.at(-1)!;

        expect(req.url).toBe('http://localhost:3000/token');
        expect(new Headers(req.headers).get('x-tenant')).toBe('acme');
        expect(new Headers(req.headers).get('x-removed')).toBeNull();
    });

    it('should fall back to the defaults of a client without toOptions', async () => {
        // a client of an older hapic copy carries the marker but has no toOptions()
        const driver = createClient({
            transport: createMetadataTransport(),
            baseURL: 'http://localhost:3000/',
        });

        driver.setAuthorizationHeader({ type: 'Bearer', token: 'secret' });

        Object.defineProperty(driver, 'toOptions', { value: undefined });

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), driver);

        expect(client.options.tokenEndpoint).toEqual('http://localhost:3000/token');
        expect(client.getBaseURL()).toBe('http://localhost:3000/');
        expect(client.getAuthorizationHeader()).toBe('Bearer secret');
    });

    it('should not carry over the hooks of the passed client', async () => {
        const transport = createMetadataTransport();
        const driver = createClient({ transport });
        const hook = vi.fn((options) => options);

        driver.on(HookName.REQUEST, hook);

        const client = await createClientWithOpenIDDiscoveryURL(buildOpenIDDiscoveryURL(), driver);

        expect(hook).toHaveBeenCalledTimes(1);

        await client.token.createWithClientCredentials({
            client_id: 'client',
            client_secret: 'secret',
        });

        expect(hook).toHaveBeenCalledTimes(1);
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
