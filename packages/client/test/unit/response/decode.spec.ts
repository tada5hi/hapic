/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { decodeResponse } from '../../../src/response/decode';

function createResponse(body: BodyInit | null, contentType?: string) {
    const headers = new Headers();

    if (contentType) {
        headers.set('content-type', contentType);
    }

    return new Response(body, { status: 200, headers });
}

describe('src/response/decode', () => {
    describe('explicit responseType', () => {
        it('should decode json', async () => {
            const res = await decodeResponse(createResponse('{"a":1}'), { responseType: 'json' });

            expect(res.data).toEqual({ a: 1 });
        });

        it('should fall back to text for an unparsable json body', async () => {
            const res = await decodeResponse(createResponse('not json'), { responseType: 'json' });

            expect(res.data).toBe('not json');
        });

        it('should decode text', async () => {
            const res = await decodeResponse(
                createResponse('{"a":1}', 'application/json'),
                { responseType: 'text' },
            );

            expect(res.data).toBe('{"a":1}');
        });

        it('should decode a blob', async () => {
            const res = await decodeResponse(createResponse('blob', 'application/json'), { responseType: 'blob' });

            expect(res.data).toBeInstanceOf(Blob);
            expect(await (res.data as Blob).text()).toBe('blob');
        });

        it('should decode an array buffer', async () => {
            const res = await decodeResponse(createResponse('ab'), { responseType: 'arrayBuffer' });

            expect(res.data).toBeInstanceOf(ArrayBuffer);
            expect(new TextDecoder().decode(res.data as ArrayBuffer)).toBe('ab');
        });

        it('should leave a stream unread', async () => {
            const raw = createResponse('stream', 'application/json');
            const res = await decodeResponse(raw, { responseType: 'stream' });

            expect(res.data).toBe(raw.body);
            expect(raw.bodyUsed).toBe(false);
        });
    });

    describe('content-type detection', () => {
        it('should decode json by content-type', async () => {
            const res = await decodeResponse(createResponse('{"a":1}', 'application/vnd.api+json; charset=utf-8'));

            expect(res.data).toEqual({ a: 1 });
        });

        it('should decode text by content-type', async () => {
            const res = await decodeResponse(createResponse('{"a":1}', 'text/plain'));

            expect(res.data).toBe('{"a":1}');
        });

        it('should return a stream without content-type', async () => {
            const raw = createResponse('stream');

            raw.headers.delete('content-type');

            const res = await decodeResponse(raw);

            expect(res.data).toBe(raw.body);
        });

        it('should return a stream for an event stream', async () => {
            const raw = createResponse('data: x\n\n', 'text/event-stream');
            const res = await decodeResponse(raw);

            expect(res.data).toBe(raw.body);
        });

        it('should try json for an unknown content-type and fall back to text', async () => {
            const parsed = await decodeResponse(createResponse('[1,2]', 'application/octet-stream'));

            expect(parsed.data).toEqual([1, 2]);

            const fallback = await decodeResponse(createResponse('raw', 'application/octet-stream'));

            expect(fallback.data).toBe('raw');
        });
    });

    describe('data accessor', () => {
        it('should decorate the given response in place', async () => {
            const raw = createResponse('{"a":1}', 'application/json');
            const res = await decodeResponse(raw);

            expect(res).toBe(raw);
        });

        it('should let an assignment replace the decoded data', async () => {
            const res = await decodeResponse(createResponse('{"a":1}', 'application/json'));

            res.data = { b: 2 };
            expect(res.data).toEqual({ b: 2 });
        });
    });
});
