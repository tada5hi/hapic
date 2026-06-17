/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import type {
    CompactorDeletionRequestCancel,
    CompactorDeletionRequestCreate,
} from '../../../src';
import {
    CompactorAPI,
} from '../../../src';

describe('src/domains/compactor', () => {
    it('should create deletion request', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const payload : CompactorDeletionRequestCreate = {
            query: '{app="foo"}',
            start: BigInt(1000),
        };

        const api = new CompactorAPI({ client: createClient({ transport }) });
        await api.createDeletionRequest(payload);

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('POST');
        expect(req.url).toBe('loki/api/v1/delete?query=%7Bapp=%22foo%22%7D&start=1000');
        expect(JSON.parse(req.body as string)).toEqual({});

        const headers = req.headers as Headers;
        expect(headers.get(HeaderName.CONTENT_TYPE)).toBe('application/json');
    });

    it('should cancel deletion request', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const payload : CompactorDeletionRequestCancel = {
            request_id: BigInt(1000),
            force: true,
        };

        const api = new CompactorAPI({ client: createClient({ transport }) });
        await api.cancelDeletionRequest(payload);

        const req = transport.requests.at(-1)!;
        expect(req.method).toBe('DELETE');
        expect(req.url).toBe('loki/api/v1/delete?request_id=1000&force=true');
        expect(req.body).toBeUndefined();

        const headers = req.headers as Headers;
        expect(headers.get(HeaderName.CONTENT_TYPE)).toBe('application/json');
    });
});
