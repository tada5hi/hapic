/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ResponseType } from '../../constants';
import { HeaderName } from '../../header/constants';
import type { Response, ResponseData } from '../types';
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
 * Decode a raw (unread) transport response: pick the response type
 * (options.responseType or Content-Type detection), read the body
 * accordingly and expose it through a lazy `data` accessor
 * (a later assignment to `response.data` replaces the decoded value).
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

    let data = await readResponseBody(response, responseType) as ResponseData<RT, T>;

    Object.defineProperty(response, 'data', {
        get() {
            return data;
        },
        set(value: ResponseData<RT, T>) {
            data = value;
        },
    });

    return response as Response<ResponseData<RT, T>>;
}
