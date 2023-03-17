/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, useClient } from '../../src';

describe('src/client', () => {
    it('should create singleton', () => {
        const client = useClient();
        expect(client).toBeInstanceOf(Client);

        expect(client).toEqual(useClient());
    });

    it('should have client properties', () => {
        const client = useClient();
        expect(client.project).toBeDefined();
        expect(client.search).toBeDefined();
    });
});
