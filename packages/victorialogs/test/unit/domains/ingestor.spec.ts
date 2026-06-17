/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import { IngestorAPI } from '../../../src';
import type { IngestorData } from '../../../src';

describe('src/domains/ingestor', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const payload : IngestorData = {
            app: 'foo',
            _msg: 'This is a log message.',
        };

        const api = new IngestorAPI({ client: createClient({ transport }) });
        await api.insert(payload);

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('POST');
        expect(req.url).toBe('/insert/jsonline');

        const headers = new Headers(req.init.headers);
        expect(headers.get(HeaderName.CONTENT_TYPE)).toBe('application/json');

        expect(JSON.parse(req.init.body as string)).toEqual(payload);
    });
});
