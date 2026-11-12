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

    protected type = '';

    protected data = '';

    protected hasData = false;

    protected retry : number | undefined;

    protected lastEventId = '';

    feed(chunk: string) : EventStreamMessage[] {
        const output : EventStreamMessage[] = [];

        // The pending rest holds no line break, except a trailing CR.
        let index = this.rest.endsWith('\r') ?
            this.rest.length - 1 :
            this.rest.length;

        let text = this.rest + chunk;

        if (!this.started && text.length > 0) {
            this.started = true;

            if (text.charCodeAt(0) === BOM) {
                text = text.slice(1);
            }
        }

        let start = 0;

        while (index < text.length) {
            const code = text.charCodeAt(index);

            if (code !== LF && code !== CR) {
                index++;

                continue;
            }

            if (code === CR && index + 1 === text.length) {
                // Might be the first half of a CRLF split across two chunks.
                break;
            }

            this.processLine(text.slice(start, index), output);

            index += code === CR && text.charCodeAt(index + 1) === LF ? 2 : 1;
            start = index;
        }

        this.rest = text.slice(start);

        return output;
    }

    /**
     * Signal the end of the stream. An event which is not terminated
     * by a blank line is discarded, as the specification requires.
     */
    end() : EventStreamMessage[] {
        const output : EventStreamMessage[] = [];

        if (this.rest.endsWith('\r')) {
            this.processLine(this.rest.slice(0, -1), output);
        }

        this.rest = '';

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
