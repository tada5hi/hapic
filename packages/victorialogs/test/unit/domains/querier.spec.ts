/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import { QuerierAPI } from '../../../src';

describe('src/domains/distributor', () => {
    it('should query', async () => {
        const text = '{"_time":"2026-01-07T10:56:35.399492947Z","_stream_id":"","_stream":"{}","_msg":"world!"}\n' +
            '{"_time":"2026-01-07T10:56:40.399492947Z","_stream_id":"","_stream":"{}","_msg":"Hello"}';

        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: {
                    [HeaderName.CONTENT_TYPE]: 'application/stream+json',
                },
                body: text,
            }),
        });

        const query : string = 'log.level:*';

        const api = new QuerierAPI({ client: createClient({ transport }) });
        const response = await api.query({
            query,
            limit: 10,
        });

        expect(response.length).toEqual(2);

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('GET');
        expect(req.url).toBe('select/logsql/query?query=log.level:*&limit=10');
        expect(req.body).toBeUndefined();

        const headers = new Headers(req.headers);
        expect(headers.get(HeaderName.ACCEPT)).toBe('application/json');
    });
});
