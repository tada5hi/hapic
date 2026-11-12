/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EventStreamMessage } from './types';

const LF = 0x0A;
const CR = 0x0D;
const BOM = 0xFEFF;

/**
 * Incremental interpreter for the `text/event-stream` format.
 *
 * @see https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation
 */
export class EventStreamParser {
    protected rest = '';

    protected started = false;

    protected skipLF = false;

    protected type = '';

    protected data = '';

    protected hasData = false;

    protected retry : number | undefined;

    protected lastEventId = '';

    feed(chunk: string) : EventStreamMessage[] {
        const output : EventStreamMessage[] = [];

        if (chunk.length === 0) {
            return output;
        }

        let offset = 0;

        if (!this.started) {
            this.started = true;

            if (chunk.charCodeAt(0) === BOM) {
                offset = 1;
            }
        }

        if (this.skipLF) {
            this.skipLF = false;

            // Second half of a CRLF which was split across two chunks.
            if (chunk.charCodeAt(offset) === LF) {
                offset++;
            }
        }

        // The pending rest holds no line break.
        let index = this.rest.length;
        let start = 0;

        const text = this.rest + (offset > 0 ? chunk.slice(offset) : chunk);

        while (index < text.length) {
            const code = text.charCodeAt(index);

            if (code !== LF && code !== CR) {
                index++;

                continue;
            }

            this.processLine(text.slice(start, index), output);

            index++;

            if (code === CR) {
                if (index === text.length) {
                    // A CR ends the line right away, so a complete event is not held back
                    // on an open stream. A LF opening the next chunk belongs to it.
                    this.skipLF = true;
                } else if (text.charCodeAt(index) === LF) {
                    index++;
                }
            }

            start = index;
        }

        this.rest = text.slice(start);

        return output;
    }

    protected processLine(line: string, output: EventStreamMessage[]) {
        if (line.length === 0) {
            this.dispatch(output);

            return;
        }

        const colon = line.indexOf(':');

        if (colon === 0) {
            // comment
            return;
        }

        let field = line;
        let value = '';

        if (colon !== -1) {
            field = line.slice(0, colon);
            value = line.slice(line.charCodeAt(colon + 1) === 0x20 ? colon + 2 : colon + 1);
        }

        switch (field) {
            case 'event': {
                this.type = value;

                break;
            }
            case 'data': {
                this.data = this.hasData ? `${this.data}\n${value}` : value;
                this.hasData = true;

                break;
            }
            case 'id': {
                if (!value.includes('\0')) {
                    this.lastEventId = value;
                }

                break;
            }
            case 'retry': {
                if (/^[0-9]+$/.test(value)) {
                    this.retry = Number.parseInt(value, 10);
                }

                break;
            }
            default:
        }
    }

    protected dispatch(output: EventStreamMessage[]) {
        if (this.hasData) {
            const message : EventStreamMessage = {
                type: this.type || 'message',
                data: this.data,
                lastEventId: this.lastEventId,
            };

            if (typeof this.retry !== 'undefined') {
                message.retry = this.retry;
            }

            output.push(message);
        }

        this.type = '';
        this.data = '';
        this.hasData = false;
        this.retry = undefined;
    }
}
