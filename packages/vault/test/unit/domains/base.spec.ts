/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { MountAPI } from '../../../src';

function createTransport() {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        }),
    });
}

describe('src/domains/base', () => {
    it('should replace the client with setClient', async () => {
        const transport = createTransport();
        const api = new MountAPI();

        api.setClient(createClient({ transport }));

        await api.delete('key');
        expect(transport.requests).toHaveLength(1);
    });

    it('should replace the client with the deprecated setDriver alias', async () => {
        const transport = createTransport();
        const api = new MountAPI();

        api.setDriver(createClient({ transport }));

        await api.delete('key');
        expect(transport.requests).toHaveLength(1);
    });
});
