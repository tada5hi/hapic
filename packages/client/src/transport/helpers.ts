/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// node-fetch-native is used as a fallback when no global Response is available.
import { Response as NodeResponse } from 'node-fetch-native';
import {
    isArrayBuffer,
    isBlob,
    isURLSearchParams,
} from '../utils';
import { globalContext } from '../utils/global-this.ts';
import type { UploadProgressEvent, UploadProgressListener } from './types';

const ResponseCtor : typeof NodeResponse = (globalContext.Response as typeof NodeResponse | undefined) ||
    NodeResponse;

/**
 * Build a `Response` with the global constructor (node-fetch-native's where
 * none exists).
 */
export function createResponse(body?: any, init?: ResponseInit) : Response {
    return new ResponseCtor(body, init as any) as unknown as Response;
}

/**
 * The size of a body in bytes when it is known without reading it:
 * a string, a blob, an ArrayBuffer (or view) or url search params.
 */
export function getBodySize(input: unknown) : number | undefined {
    if (typeof input === 'string') {
        return new TextEncoder().encode(input).byteLength;
    }

    if (isBlob(input)) {
        return input.size;
    }

    if (isArrayBuffer(input)) {
        return input.byteLength;
    }

    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(input)) {
        return input.byteLength;
    }

    if (isURLSearchParams(input)) {
        return new TextEncoder().encode(String(input)).byteLength;
    }

    return undefined;
}

/**
 * Call the listener; an error it throws must not fail the upload.
 */
export function notifyUploadProgress(
    listener: UploadProgressListener,
    event: UploadProgressEvent,
) : void {
    try {
        listener(event);
    } catch {
        // ignore
    }
}

/**
 * Wrap a stream into one that reports the bytes it hands out to the reader
 * (the fetch implementation sending it).
 */
export function countUploadProgress(
    stream: ReadableStream<Uint8Array>,
    listener: UploadProgressListener,
    total?: number,
) : ReadableStream<Uint8Array> {
    const reader = stream.getReader();
    let loaded = 0;

    return new ReadableStream<Uint8Array>({
        async pull(controller) {
            const { done, value } = await reader.read();

            if (done) {
                controller.close();

                return;
            }

            loaded += value.byteLength ?? 0;
            controller.enqueue(value);

            notifyUploadProgress(listener, { loaded, total });
        },
        cancel(reason) {
            return reader.cancel(reason);
        },
    });
}
