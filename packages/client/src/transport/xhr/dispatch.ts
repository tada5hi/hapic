/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers } from '../../fetch';
import { globalContext } from '../../utils/global-this.ts';
import { createResponse, notifyUploadProgress } from '../helpers';
import type { TransportRequest } from '../types';

/**
 * Statuses a Response must be built without a body for.
 */
const NULL_BODY_STATUSES = [101, 103, 204, 205, 304];

function parseResponseHeaders(input: string) : Headers {
    const headers = new Headers();

    for (const line of input.split(/\r?\n/)) {
        const index = line.indexOf(':');

        if (index > 0) {
            headers.append(line.slice(0, index).trim(), line.slice(index + 1).trim());
        }
    }

    return headers;
}

function createAbortError() : Error {
    const error = new Error('The operation was aborted.');

    error.name = 'AbortError';

    return error;
}

/**
 * Send a request by XMLHttpRequest and resolve with an unread Response, as
 * fetch does: reject on a network failure (TypeError) or an abort (the
 * signal's reason), never for a 4xx/5xx status.
 *
 * The body must be one XMLHttpRequest#send() takes as it is (see
 * isXMLHttpRequestBody). The proxy option does not apply.
 */
export function dispatchXMLHttpRequest(request: TransportRequest) : Promise<Response> {
    const {
        url,
        method,
        headers,
        body,
        signal,
        credentials,
        onUploadProgress,
    } = request;

    if (signal && signal.aborted) {
        return Promise.reject(signal.reason);
    }

    return new Promise<Response>((resolve, reject) => {
        const xhr : XMLHttpRequest = new (globalContext as any).XMLHttpRequest();
        const requestMethod = (method || 'GET').toUpperCase();

        const abort = () => xhr.abort();
        const settle = () => {
            if (signal) {
                signal.removeEventListener('abort', abort);
            }
        };

        xhr.open(requestMethod, url);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = credentials === 'include';

        new Headers(headers).forEach((value, key) => {
            xhr.setRequestHeader(key, value);
        });

        if (onUploadProgress) {
            xhr.upload.addEventListener('progress', (event) => {
                notifyUploadProgress(onUploadProgress, {
                    loaded: event.loaded,
                    total: event.lengthComputable ? event.total : undefined,
                });
            });
        }

        xhr.addEventListener('load', () => {
            settle();

            const nullBody = requestMethod === 'HEAD' ||
                NULL_BODY_STATUSES.includes(xhr.status);

            const response = createResponse(nullBody ? null : xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
            });

            // A constructed Response has an empty url and is never redirected.
            const responseURL = xhr.responseURL || url;

            Object.defineProperties(response, {
                url: { value: responseURL, configurable: true },
                redirected: { value: responseURL !== url, configurable: true },
            });

            resolve(response);
        });

        xhr.addEventListener('error', () => {
            settle();
            reject(new TypeError('Failed to fetch'));
        });

        xhr.addEventListener('abort', () => {
            settle();
            reject(signal && signal.aborted ? signal.reason : createAbortError());
        });

        if (signal) {
            signal.addEventListener('abort', abort, { once: true });
        }

        xhr.send((body ?? null) as XMLHttpRequestBodyInit | null);
    });
}
