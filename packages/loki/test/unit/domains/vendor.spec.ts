/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import { DistributorAPI } from '../../../src';
import type { DistributorPushStream } from '../../../src';

describe('src/domains/distributor', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const payload : DistributorPushStream = {
            stream: {
                app: 'foo',
            },
            values: [
                [BigInt(1000), 'This is a log message.'],
            ],
        };

        const api = new DistributorAPI({ client: createClient({ transport }) });
        await api.push(payload);

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('POST');
        expect(req.url).toBe('loki/api/v1/push');
        expect(JSON.parse(req.init.body as string)).toEqual({
            streams: [
                {
                    stream: {
                        app: 'foo',
                    },
                    values: [
                        ['1000', 'This is a log message.'],
                    ],
                },
            ],
        });

        const headers = req.init.headers as Headers;
        expect(headers.get(HeaderName.CONTENT_TYPE)).toBe('application/json');
    });
});
