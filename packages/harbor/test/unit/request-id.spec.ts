/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HookName, MemoryTransport } from 'hapic';
import { HarborClient, HeaderName } from '../../src';

function createTransport() {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        }),
    });
}

describe('X-Request-Id', () => {
    it('should send a client-wide request id on domain calls', async () => {
        const transport = createTransport();
        const client = new HarborClient({ request: { transport } });

        client.setHeader(HeaderName.REQUEST_ID, 'abc');

        await client.project.getOne(1);

        expect((transport.requests.at(-1)!.headers as Headers).get(HeaderName.REQUEST_ID)).toBe('abc');
    });

    it('should send a request id set per request by a hook', async () => {
        const transport = createTransport();
        const client = new HarborClient({ request: { transport } });

        let counter = 0;

        client.on(HookName.REQUEST, (options) => {
            counter++;
            (options.headers as Headers).set(HeaderName.REQUEST_ID, `req-${counter}`);

            return options;
        });

        await client.project.getOne(1);
        await client.robot.getOne(2);

        expect(transport.requests.map((r) => (r.headers as Headers).get(HeaderName.REQUEST_ID)))
            .toEqual(['req-1', 'req-2']);
    });
});
