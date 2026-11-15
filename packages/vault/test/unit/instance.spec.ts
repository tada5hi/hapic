/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport } from 'hapic';
import {
    VaultClient,
    createClient,
    isClient,
    unsetClient,
    useClient,
} from '../../src';

describe('src/instance', () => {
    it('should create client by connectionString', () => {
        const client = new VaultClient({ connectionString: 'mytoken@https://vault.example.com/v1/' });

        expect(client.getBaseURL()).toEqual('https://vault.example.com/v1/');
        expect(client.getHeader('X-Vault-Token')).toEqual('mytoken');
    });

    it('should send the namespace from the connection options', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });
        const client = new VaultClient({
            request: { transport },
            connectionOptions: {
                host: 'https://vault.example.com/v1/',
                token: 'mytoken',
                namespace: 'team-a/sub',
            },
        });

        await client.keyValueV2.delete('secret', 'key');

        const req = transport.requests.at(-1)!;

        expect(new Headers(req.headers).get('X-Vault-Namespace')).toBe('team-a/sub');
    });

    it('should send the namespace from the connection string', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });
        const client = new VaultClient({
            request: { transport },
            connectionString: 'mytoken@https://vault.example.com/v1/?namespace=team-a%2Fsub',
        });

        expect(client.getBaseURL()).toEqual('https://vault.example.com/v1/');

        await client.keyValueV2.delete('secret', 'key');

        const req = transport.requests.at(-1)!;

        expect(req.url).toBe('https://vault.example.com/v1/secret/data/key');
        expect(new Headers(req.headers).get('X-Vault-Namespace')).toBe('team-a/sub');
    });

    it('should drop the namespace when the config is applied again without one', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });
        const client = new VaultClient({
            request: { transport },
            connectionString: 'mytoken@https://vault.example.com/v1/?namespace=team-a',
        });

        client.applyConfig({ connectionString: 'other@https://vault.other.com/v1/' });

        await client.keyValueV2.delete('secret', 'key');

        const req = transport.requests.at(-1)!;

        expect(req.url).toBe('https://vault.other.com/v1/secret/data/key');
        expect(new Headers(req.headers).get('X-Vault-Token')).toBe('other');
        expect(new Headers(req.headers).get('X-Vault-Namespace')).toBeNull();
    });

    it('should keep a namespace set by hand when no connection is configured', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });
        const client = new VaultClient({ request: { transport, baseURL: 'https://vault.example.com/v1/' } });

        client.setNamespace('team-a');
        client.applyConfig();

        await client.keyValueV2.delete('secret', 'key');

        expect(new Headers(transport.requests.at(-1)!.headers).get('X-Vault-Namespace')).toBe('team-a');
    });

    it('should not send a namespace without one', async () => {
        const transport = new MemoryTransport({ fetch: () => ({ status: 204 }) });
        const client = new VaultClient({
            request: { transport },
            connectionString: 'mytoken@https://vault.example.com/v1/',
        });

        await client.keyValueV2.delete('secret', 'key');

        const req = transport.requests.at(-1)!;

        expect(new Headers(req.headers).has('X-Vault-Namespace')).toBe(false);
    });

    it('should guard its own instances', () => {
        expect(isClient(createClient())).toBeTruthy();
        expect(isClient({})).toBeFalsy();
    });

    it('should have client properties', () => {
        const client = useClient();

        expect(client.keyValueV1).toBeDefined();
        expect(client.mount).toBeDefined();

        unsetClient();
    });
});
