/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * A parsed server-sent event. The property names follow the browser's `MessageEvent`.
 */
export type EventStreamMessage = {
    /**
     * The event type, taken from the `event` field. Defaults to `message`.
     */
    type: string,
    /**
     * The payload. Multiple `data` fields are joined with a line feed.
     */
    data: string,
    /**
     * The last `id` field seen on the stream. It persists across events
     * until the stream sets another one; empty if none was set.
     */
    lastEventId: string,
    /**
     * The stream's current reconnection time in milliseconds: the value of
     * the last valid `retry` field received so far, whether it was sent with
     * this message or in an earlier block (with or without data). Absent
     * until the stream sends a valid `retry` field.
     */
    retry?: number,
};
