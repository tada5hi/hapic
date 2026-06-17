/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, stringifyAuthorizationHeader } from 'hapic';
import {
    HarborClient,
    createClient,
    hasClient,
    setClient,
    unsetClient,
    useClient,
} from '../../src';

describe('src/instance', () => {
    it('should create client by connectionString', () => {
        const client = new HarborClient({
            connectionString: 'admin:start123@https://example.com/api/v2.0/',
        });

        expect(client.getBaseURL()).toEqual('https://example.com/api/v2.0/');
        expect(client.getAuthorizationHeader()).toEqual(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'admin',
            password: 'start123',
        }));
    });
    it('should be manageable by singleton', () => {
        expect(hasClient()).toBeFalsy();

        const client = setClient(createClient());
        expect(client).toEqual(useClient());

        expect(hasClient()).toBeTruthy();

        unsetClient();
    });

    it('should dispatch through a transport injected via config', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: [],
        });

        const client = new HarborClient({ request: { transport } });
        await client.project.getMany({ query: { page_size: 10 } });

        expect(transport.lastRequest?.init.method).toBe('GET');
        expect(transport.lastRequest?.url).toBe('projects?page_size=10');
    });

    it('should have client properties', () => {
        const client = useClient();

        expect(client.project).toBeDefined();
        expect(client.search).toBeDefined();

        unsetClient();
    });
});
