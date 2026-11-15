/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, MemoryTransport, createClient } from 'hapic';
import { afterEach, vi } from 'vitest';
import { QuerierAPI } from '../../../src';

function createTransport(body: string | undefined) {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { [HeaderName.CONTENT_TYPE]: 'application/stream+json' },
            body,
        }),
    });
}

describe('src/domains/querier', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should query', async () => {
        const text = '{"_time":"2026-01-07T10:56:35.399492947Z","_stream_id":"","_stream":"{}","_msg":"world!"}\n' +
            '{"_time":"2026-01-07T10:56:40.399492947Z","_stream_id":"","_stream":"{}","_msg":"Hello"}';

        const transport = createTransport(text);

        const query : string = 'log.level:*';

        const api = new QuerierAPI({ client: createClient({ transport }) });
        const response = await api.query({
            query,
            limit: 10,
        });

        expect(response).toEqual([
            {
                _time: '2026-01-07T10:56:35.399492947Z',
                _stream_id: '',
                _stream: '{}',
                _msg: 'world!',
            },
            {
                _time: '2026-01-07T10:56:40.399492947Z',
                _stream_id: '',
                _stream: '{}',
                _msg: 'Hello',
            },
        ]);

        const req = transport.requests.at(-1)!;

        expect(req.method).toBe('GET');
        expect(req.url).toBe('select/logsql/query?query=log.level:*&limit=10');
        expect(req.body).toBeUndefined();

        const headers = new Headers(req.headers);

        expect(headers.get(HeaderName.ACCEPT)).toBe('application/json');
    });

    it('should split CRLF lines and skip blank lines and a trailing newline', async () => {
        const text = '{"_msg":"a"}\r\n\r\n{"_msg":"b"}\n   \n{"_msg":"c"}\r\n';

        const api = new QuerierAPI({ client: createClient({ transport: createTransport(text) }) });
        const response = await api.query({ query: '*' });

        expect(response).toEqual([
            { _msg: 'a' },
            { _msg: 'b' },
            { _msg: 'c' },
        ]);
    });

    it('should return an empty array for an empty body', async () => {
        const api = new QuerierAPI({ client: createClient({ transport: createTransport('') }) });

        expect(await api.query({ query: '*' })).toEqual([]);
    });

    it('should use the querier url as base url', async () => {
        const transport = createTransport('{"_msg":"a"}\n');

        const api = new QuerierAPI({
            client: createClient({ transport }),
            options: { querierURL: 'http://querier:9428/' },
        });

        await api.query({ query: '*', limit: 1 });

        expect(transport.requests.at(-1)!.url)
            .toBe('http://querier:9428/select/logsql/query?query=*&limit=1');
    });

    it('should not depend on a global Response constructor', async () => {
        const api = new QuerierAPI({ client: createClient({ transport: createTransport('{"_msg":"a"}\n') }) });

        vi.stubGlobal('Response', undefined);

        expect(await api.query({ query: '*' })).toEqual([{ _msg: 'a' }]);
    });
});
