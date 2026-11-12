/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EventStreamParser } from './parser';
import type { EventStreamMessage } from './types';

/**
 * A `TransformStream` turning decoded `text/event-stream` chunks into events.
 * Pipe a byte stream through a `TextDecoderStream` first.
 *
 * ```typescript
 * const events = textStream.pipeThrough(new EventStreamParserStream());
 * ```
 */
export class EventStreamParserStream extends TransformStream<string, EventStreamMessage> {
    constructor() {
        const parser = new EventStreamParser();

        super({
            transform(chunk, controller) {
                if (typeof chunk !== 'string') {
                    throw new TypeError('The event stream parser expects string chunks.');
                }

                const messages = parser.feed(chunk);

                for (const message of messages) {
                    controller.enqueue(message);
                }
            },
            flush(controller) {
                const messages = parser.end();

                for (const message of messages) {
                    controller.enqueue(message);
                }
            },
        });
    }
}

/**
 * Parse the server-sent events of a response (or of its body stream).
 *
 * Implements the event stream interpretation of the WHATWG HTML Standard.
 * The API is inspired by `parse-sse` by Sindre Sorhus (https://github.com/sindresorhus/parse-sse).
 *
 * ```typescript
 * const response = await client.get('events', { responseType: 'stream' });
 *
 * for await (const message of parseEventStream(response)) {
 *     console.log(message.type, message.data);
 * }
 * ```
 *
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
 */
export function parseEventStream(
    input: Response | ReadableStream<Uint8Array>,
) : ReadableStream<EventStreamMessage> {
    const body = isReadableStream(input) ? input : input.body;

    if (!body) {
        throw new TypeError('The response has no body to parse.');
    }

    return (body as ReadableStream<BufferSource>)
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventStreamParserStream());
}

function isReadableStream(input: unknown) : input is ReadableStream<Uint8Array> {
    return typeof (input as ReadableStream).pipeThrough === 'function';
}
