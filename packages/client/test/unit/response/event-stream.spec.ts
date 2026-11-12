/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EventStreamMessage } from '../../../src';
import { EventStreamParserStream, parseEventStream } from '../../../src';

function createByteStream(chunks: string[]) : ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }

            controller.close();
        },
    });
}

async function collect(stream: ReadableStream<EventStreamMessage>) : Promise<EventStreamMessage[]> {
    const output : EventStreamMessage[] = [];
    const reader = stream.getReader();

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        output.push(value);
    }

    return output;
}

async function parse(...chunks: string[]) : Promise<EventStreamMessage[]> {
    return collect(parseEventStream(createByteStream(chunks)));
}

describe('src/response/event-stream', () => {
    it('should parse a message', async () => {
        expect(await parse('data: hello\n\n')).toEqual([
            {
                type: 'message',
                data: 'hello',
                lastEventId: '',
            },
        ]);
    });

    it('should parse a response', async () => {
        const response = new Response(createByteStream(['data: hello\n\n']));

        expect(await collect(parseEventStream(response))).toEqual([
            {
                type: 'message',
                data: 'hello',
                lastEventId: '',
            },
        ]);
    });

    it('should throw for a response without a body', () => {
        expect(() => parseEventStream(new Response(null))).toThrow(TypeError);
    });

    it('should parse event, id and retry', async () => {
        expect(await parse('event: update\nid: 1\nretry: 1000\ndata: a\n\n')).toEqual([
            {
                type: 'update',
                data: 'a',
                lastEventId: '1',
                retry: 1000,
            },
        ]);
    });

    it('should join multiple data fields', async () => {
        const messages = await parse('data: a\ndata:\ndata: b\n\n');

        expect(messages.map((m) => m.data)).toEqual(['a\n\nb']);
    });

    it('should dispatch an empty data field', async () => {
        const messages = await parse('data:\n\n');

        expect(messages.map((m) => m.data)).toEqual(['']);
    });

    it('should not dispatch without a data field', async () => {
        expect(await parse('event: update\nid: 1\n\n')).toEqual([]);
    });

    it('should only strip a single leading space', async () => {
        const messages = await parse('data:a\ndata:  b\n\n');

        expect(messages.map((m) => m.data)).toEqual(['a\n b']);
    });

    it('should treat a line without a colon as a field with an empty value', async () => {
        const messages = await parse('data\n\n');

        expect(messages.map((m) => m.data)).toEqual(['']);
    });

    it('should ignore comments and unknown fields', async () => {
        const messages = await parse(': ping\n\nfoo: bar\ndata: a\n: note\n\n');

        expect(messages.map((m) => m.data)).toEqual(['a']);
    });

    it('should accept CRLF, CR and LF line breaks', async () => {
        const messages = await parse('data: a\r\n\r\ndata: b\r\rdata: c\n\n');

        expect(messages.map((m) => m.data)).toEqual(['a', 'b', 'c']);
    });

    it('should parse fields split across chunks', async () => {
        const messages = await parse('da', 'ta: he', 'llo\n', '\ndata: wor', 'ld\n\n');

        expect(messages.map((m) => m.data)).toEqual(['hello', 'world']);
    });

    it('should not dispatch early for a CRLF split across chunks', async () => {
        const messages = await parse('data: a\r', '\ndata: b\r', '\n\r', '\n');

        expect(messages.map((m) => m.data)).toEqual(['a\nb']);
    });

    it('should dispatch an event terminated by a trailing CR', async () => {
        const messages = await parse('data: a\r\r');

        expect(messages.map((m) => m.data)).toEqual(['a']);
    });

    it('should dispatch a CR terminated event while the stream stays open', async () => {
        let controller! : ReadableStreamDefaultController<string>;

        const source = new ReadableStream<string>({
            start(ctrl) {
                controller = ctrl;
            },
        });

        const reader = source.pipeThrough(new EventStreamParserStream()).getReader();

        controller.enqueue('data: a\r\r');

        const first = await reader.read();

        expect(first.value?.data).toEqual('a');

        // A LF opening the next chunk completes the CRLF and is no blank line.
        controller.enqueue('\ndata: b\r');
        controller.enqueue('\n\r');

        const second = await reader.read();

        expect(second.value?.data).toEqual('b');

        controller.close();

        expect((await reader.read()).done).toBe(true);
    });

    it('should decode multi-byte characters split across chunks', async () => {
        const bytes = new TextEncoder().encode('data: €\n\n');
        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                controller.enqueue(bytes.slice(0, 7));
                controller.enqueue(bytes.slice(7));
                controller.close();
            },
        });

        const messages = await collect(parseEventStream(stream));

        expect(messages.map((m) => m.data)).toEqual(['€']);
    });

    it('should discard an event which is not terminated by a blank line', async () => {
        const messages = await parse('data: a\n\ndata: b\n');

        expect(messages.map((m) => m.data)).toEqual(['a']);
    });

    it('should keep the last event id across events', async () => {
        const messages = await parse('id: 1\ndata: a\n\ndata: b\n\nid\ndata: c\n\n');

        expect(messages.map((m) => m.lastEventId)).toEqual(['1', '1', '']);
    });

    it('should ignore an id containing a null character', async () => {
        const messages = await parse('id: 1\ndata: a\n\nid: 2\0\ndata: b\n\n');

        expect(messages.map((m) => m.lastEventId)).toEqual(['1', '1']);
    });

    it('should ignore a retry which is not an integer', async () => {
        const messages = await parse('retry: 1s\ndata: a\n\n');

        expect(messages[0]).not.toHaveProperty('retry');
    });

    it('should reset type and retry after dispatching', async () => {
        const messages = await parse('event: update\nretry: 5\ndata: a\n\ndata: b\n\n');

        expect(messages[1]).toEqual({
            type: 'message',
            data: 'b',
            lastEventId: '',
        });
    });

    it('should strip a leading byte order mark', async () => {
        const stream = new ReadableStream<string>({
            start(controller) {
                controller.enqueue('\u{FEFF}data: a\n\n');
                controller.close();
            },
        }).pipeThrough(new EventStreamParserStream());

        expect((await collect(stream)).map((m) => m.data)).toEqual(['a']);
    });

    it('should reject chunks which are not strings', async () => {
        const stream = createByteStream(['data: a\n\n'])
            .pipeThrough(new EventStreamParserStream() as unknown as TransformStream<Uint8Array, EventStreamMessage>);

        await expect(collect(stream)).rejects.toThrow(TypeError);
    });
});
