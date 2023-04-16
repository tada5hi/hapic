/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { stringifyAuthorizationHeader } from 'hapic';
import {
    HarborClient,
    createHarborClient,
    hasHarborClient,
    setHarborClient,
    unsetHarborClient,
    useHarborClient,
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
        expect(hasHarborClient()).toBeFalsy();

        const client = setHarborClient(createHarborClient());
        expect(client).toEqual(useHarborClient());

        expect(hasHarborClient()).toBeTruthy();

        unsetHarborClient();
    });

    it('should have client properties', () => {
        const client = useHarborClient();

        expect(client.project).toBeDefined();
        expect(client.search).toBeDefined();

        unsetHarborClient();
    });
});
