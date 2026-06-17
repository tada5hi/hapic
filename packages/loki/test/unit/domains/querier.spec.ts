/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import type {
    QuerierQueryOptions,
    QuerierQueryRangeOptions,
    QuerierQueryResult,
} from '../../../src';
import { QuerierAPI } from '../../../src';

describe('src/domains/querier', () => {
    it('should query', async () => {
        const transport = new MemoryTransport();
        const body : QuerierQueryResult = {
            status: 'success',
            data: {
                resultType: 'streams',
                result: [],
                stats: {},
            },
        };
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body,
        });

        const payload : QuerierQueryOptions = {
            query: '{app="foo"}',
            limit: 10,
            direction: 'backward',
            time: BigInt(1000),
        };

        const api = new QuerierAPI({ client: createClient({ transport }) });
        const result = await api.query(payload);

        expect(result).toEqual(body);

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('GET');
        expect(req.url).toBe('loki/api/v1/query?query=%7Bapp=%22foo%22%7D&limit=10&direction=backward&time=1000');
        expect(req.init.body).toBeUndefined();

        const headers = req.init.headers as Headers;
        expect(headers.get(HeaderName.ACCEPT)).toBe('application/json');
    });

    it('should query range', async () => {
        const transport = new MemoryTransport();
        const body : QuerierQueryResult = {
            status: 'success',
            data: {
                resultType: 'streams',
                result: [],
                stats: {},
            },
        };
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body,
        });

        const payload : QuerierQueryRangeOptions = {
            query: '{app="foo"}',
            limit: 10,
            direction: 'backward',
            start: BigInt(1000),
            end: BigInt(10001),
        };

        const api = new QuerierAPI({ client: createClient({ transport }) });
        const result = await api.queryRange(payload);

        expect(result).toEqual(body);

        const req = transport.lastRequest!;
        expect(req.init.method).toBe('GET');
        expect(req.url).toBe('loki/api/v1/query_range?query=%7Bapp=%22foo%22%7D&limit=10&direction=backward&start=1000&end=10001');
        expect(req.init.body).toBeUndefined();

        const headers = req.init.headers as Headers;
        expect(headers.get(HeaderName.ACCEPT)).toBe('application/json');
    });
});
