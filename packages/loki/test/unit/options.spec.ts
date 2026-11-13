/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport } from 'hapic';
import type { Options } from '../../src';
import { LokiClient } from '../../src';

function createTransport() {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { [HeaderName.CONTENT_TYPE]: 'application/json' },
            body: {},
        }),
    });
}

describe('src/options', () => {
    it('should share one options object across domains without passed options', async () => {
        const transport = createTransport();
        const client = new LokiClient({ request: { transport } });

        client.compactor.setOption('querierURL', 'http://querier:3100/');
        client.distributor.setOption('compactorURL', 'http://compactor:3100/');

        await client.querier.query({ query: '{app="foo"}' });
        expect(transport.requests.at(-1)!.url.startsWith('http://querier:3100/loki/api/v1/query')).toBeTruthy();

        await client.compactor.cancelDeletionRequest({ request_id: '1' });
        expect(transport.requests.at(-1)!.url.startsWith('http://compactor:3100/loki/api/v1/delete')).toBeTruthy();
    });

    it('should share the passed options object across domains', async () => {
        const transport = createTransport();
        const options : Options = {};
        const client = new LokiClient({ request: { transport }, options });

        client.querier.setOption('distributorURL', 'http://distributor:3100/');
        expect(options.distributorURL).toBe('http://distributor:3100/');

        options.querierURL = 'http://querier:3100/';

        await client.querier.query({ query: '{app="foo"}' });
        expect(transport.requests.at(-1)!.url.startsWith('http://querier:3100/loki/api/v1/query')).toBeTruthy();
    });

    it('should use the client base URL when no override is set', async () => {
        const transport = createTransport();
        const client = new LokiClient({ request: { transport } });

        await client.querier.query({ query: '{app="foo"}' });
        expect(transport.requests.at(-1)!.url.startsWith('http://localhost:3100/loki/api/v1/query')).toBeTruthy();
    });
});
