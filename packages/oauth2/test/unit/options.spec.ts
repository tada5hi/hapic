/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport } from 'hapic';
import type { Options } from '../../src';
import { OAuth2Client } from '../../src';

function createTransport() {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { [HeaderName.CONTENT_TYPE]: 'application/json' },
            body: {},
        }),
    });
}

describe('src/options', () => {
    it('should share the client options with all domains without passed options', async () => {
        const transport = createTransport();
        const client = new OAuth2Client({ request: { transport, baseURL: 'https://idp.example.com/' } });

        client.token.setOption('userinfoEndpoint', 'https://idp.example.com/me');
        expect(client.options.userinfoEndpoint).toBe('https://idp.example.com/me');

        await client.userInfo.get('token');
        expect(transport.requests.at(-1)!.url).toBe('https://idp.example.com/me');

        client.options.clientId = 'client';
        expect(client.authorize.buildURL()).toContain('client_id=client');
    });

    it('should share the passed options object with the client and all domains', () => {
        const options : Options = {};
        const client = new OAuth2Client({ request: { baseURL: 'https://idp.example.com/' }, options });

        expect(client.options).toBe(options);

        client.userInfo.setOption('clientId', 'client');
        expect(options.clientId).toBe('client');
        expect(client.authorize.buildURL()).toContain('client_id=client');
    });
});
