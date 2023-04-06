/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver } from 'hapic';
import type { OpenIDProviderMetadata } from '../../src';
import { buildOpenIDDiscoveryURL, createClientWithOpenIDDiscoveryURL } from '../../src';

const driver = createDriver();
const fn = jest.fn();

fn.mockReturnValue({
    data: {
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
    } satisfies OpenIDProviderMetadata,
});

driver.get = fn;

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
        const url = buildOpenIDDiscoveryURL();
        const client = await createClientWithOpenIDDiscoveryURL(url, driver);

        expect(client.options.authorizationEndpoint).toEqual('http://localhost:3000/auhtorize');
        expect(client.options.tokenEndpoint).toEqual('http://localhost:3000/token');
        expect(client.options.userinfoEndpoint).toEqual('http://localhost:3000/userinfo');
    });
});
