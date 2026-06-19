/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client,
    createClient, hasClient, isClient, setClient, unsetClient, useClient,
    verifyInstanceBySymbol,
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

        // simulate a Client constructed by a duplicate package copy: cross-realm
        // identity travels in the `@instanceof` marker chain (a symbol[]).
        const fakeClient = {
            '@instanceof': [Symbol.for('hapic/Client')],
        };
        expect(isClient(fakeClient)).toBeTruthy();
    });

    it('should not verify instance', () => {
        expect(isClient(undefined)).toBeFalsy();
        expect(isClient({})).toBeFalsy();
    });

    it('verifyInstanceBySymbol (deprecated) resolves a name to its marker', () => {
        const obj = { '@instanceof': [Symbol.for('hapic/Client')] };

        expect(verifyInstanceBySymbol(obj, 'hapic/Client')).toBe(true);
        expect(verifyInstanceBySymbol(obj, 'hapic/Other')).toBe(false);
        expect(verifyInstanceBySymbol({}, 'hapic/Client')).toBe(false);
    });
});
