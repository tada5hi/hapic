/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport } from 'hapic';
import type { Options } from '../../src';
import { VictoriaLogsClient } from '../../src';

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
        const client = new VictoriaLogsClient({ request: { transport } });

        client.querier.setOption('ingesterURL', 'http://ingester:9428/');

        await client.ingestor.insert({ _msg: 'hello' });
        expect(transport.requests.at(-1)!.url).toBe('http://ingester:9428/insert/jsonline');
    });

    it('should share the passed options object across domains', async () => {
        const transport = createTransport();
        const options : Options = {};
        const client = new VictoriaLogsClient({ request: { transport }, options });

        client.ingestor.setOption('querierURL', 'http://querier:9428/');
        expect(options.querierURL).toBe('http://querier:9428/');

        options.ingesterURL = 'http://ingester:9428/';

        await client.ingestor.insert({ _msg: 'hello' });
        expect(transport.requests.at(-1)!.url).toBe('http://ingester:9428/insert/jsonline');
    });

    it('should use the client base URL when no override is set', async () => {
        const transport = createTransport();
        const client = new VictoriaLogsClient({ request: { transport } });

        await client.ingestor.insert({ _msg: 'hello' });
        expect(transport.requests.at(-1)!.url).toBe('http://localhost:9428/insert/jsonline');
    });
});
