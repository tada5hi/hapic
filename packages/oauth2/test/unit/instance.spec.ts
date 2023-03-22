/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createClient, hasClient, setClient, unsetClient, useClient,
} from '../../src';

describe('src/instance', () => {
    it('should create instance', () => {
        expect(hasClient()).toBeFalsy();

        const client = setClient(createClient());
        expect(client).toEqual(useClient());

        expect(hasClient()).toBeTruthy();

        unsetClient();
    });

    it('should have client properties', () => {
        const client = useClient();

        expect(client.token).toBeDefined();
        expect(client.authorize).toBeDefined();

        unsetClient();
    });
});
