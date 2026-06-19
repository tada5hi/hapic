/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
