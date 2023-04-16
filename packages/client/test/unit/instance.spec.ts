/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client,
    createClient, hasClient, isClient, setClient, unsetClient, useClient,
} from '../../src';

describe('src/instance', () => {
    it('should create instance', () => {
        expect(hasClient()).toBeFalsy();

        const client = setClient(createClient());
        expect(client).toEqual(useClient());

        expect(hasClient()).toBeTruthy();

        unsetClient();
    });

    it('should verify instance', () => {
        const client = new Client();
        expect(isClient(client)).toBeTruthy();

        const fakeClient = {
            '@instanceof': Symbol.for('Client'),
        };
        expect(isClient(fakeClient)).toBeTruthy();
    });

    it('should not verify instance', () => {
        expect(isClient(undefined)).toBeFalsy();
        expect(isClient({})).toBeFalsy();
    });
});
