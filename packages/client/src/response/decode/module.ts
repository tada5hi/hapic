/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ResponseType } from '../../constants';
import { HeaderName } from '../../header/constants';
import type { Response, ResponseData, ResponseTransformer } from '../types';
import { detectResponseType } from '../utils';
import type { ResponseDecodeOptions } from './types';

async function readResponseBody(
    response: Response,
    responseType: `${ResponseType}`,
) : Promise<unknown> {
    switch (responseType) {
        case ResponseType.STREAM: {
            return response.body;
        }
        case ResponseType.BLOB: {
            return response.blob();
        }
        case ResponseType.ARRAY_BUFFER: {
            return response.arrayBuffer();
        }
        case ResponseType.TEXT: {
            return response.text();
        }
        default: {
            const temp = await response.text();

            try {
                return JSON.parse(temp);
            } catch {
                return temp;
            }
        }
    }
}

/**
 * Run the decoded body through the transformer(s), each receiving the
 * response headers and status.
 *
 * On an error response (status 400-599) a throwing transformer must not
 * replace the http error: the body is then left untransformed.
 */
function applyResponseTransform(
    data: unknown,
    response: Response,
    transform?: ResponseTransformer | ResponseTransformer[],
) : unknown {
    if (!transform) {
        return data;
    }

    const transformers = Array.isArray(transform) ?
        transform :
        [transform];

    const isError = response.status >= 400 && response.status < 600;

    let output = data;

    try {
        for (const transformer of transformers) {
            output = transformer(output, response.headers, response.status);
        }
    } catch (e) {
        if (isError) {
            return data;
        }

        throw e;
    }

    return output;
}

/**
 * Decode a raw (unread) transport response: pick the response type
 * (options.responseType or Content-Type detection), read the body
 * accordingly, run it once through options.responseTransform (not for a
 * stream, nothing is decoded; a transformer throwing on a 4xx/5xx body
 * leaves it untransformed) and expose the result through a lazy `data`
 * accessor (a later assignment to `response.data` replaces it).
 *
 * The response is decorated in place and returned.
 */
export async function decodeResponse<
    T = any,
    RT extends `${ResponseType}` = `${ResponseType.JSON}`,
>(
    response: Response,
    options: ResponseDecodeOptions<RT> = {},
) : Promise<Response<ResponseData<RT, T>>> {
    const responseType = options.responseType ||
        detectResponseType(response.headers.get(HeaderName.CONTENT_TYPE));

    let data = await readResponseBody(response, responseType);

    if (responseType !== ResponseType.STREAM) {
        data = applyResponseTransform(data, response, options.responseTransform);
    }

    Object.defineProperty(response, 'data', {
        get() {
            return data as ResponseData<RT, T>;
        },
        set(value: ResponseData<RT, T>) {
            data = value;
        },
    });

    return response as Response<ResponseData<RT, T>>;
}
