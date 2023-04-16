/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createOAuth2Client, hasOAuth2Client, setOAuth2Client, unsetOAuth2Client, useOAuth2Client,
} from '../../src';

describe('src/instance', () => {
    it('should create instance', () => {
        expect(hasOAuth2Client()).toBeFalsy();

        const client = setOAuth2Client(createOAuth2Client());
        expect(client).toEqual(useOAuth2Client());

        expect(hasOAuth2Client()).toBeTruthy();

        unsetOAuth2Client();
    });

    it('should have client properties', () => {
        const client = useOAuth2Client();

        expect(client.token).toBeDefined();
        expect(client.authorize).toBeDefined();

        unsetOAuth2Client();
    });
});
