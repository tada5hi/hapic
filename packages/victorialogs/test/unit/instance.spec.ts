/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    VictoriaLogsClient,
    createClient, isClient, unsetClient, useClient,
} from '../../src';

describe('src/instance', () => {
    it('should guard its own instances', () => {
        expect(isClient(createClient())).toBeTruthy();
        expect(isClient({})).toBeFalsy();
    });

    it('should default the baseURL without mutating the provided config', () => {
        const input = {};
        const client = new VictoriaLogsClient(input);

        expect(client.getBaseURL()).toBe('http://localhost:9428/');
        // the constructor must not write into the caller's object
        expect(input).toEqual({});
    });

    it('should have client properties', () => {
        const client = useClient();

        expect(client.ingestor).toBeDefined();
        expect(client.querier).toBeDefined();

        unsetClient();
    });
});
