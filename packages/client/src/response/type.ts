/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from '../constants';

export type ResponseData<RT extends `${ResponseType}` = `${ResponseType.JSON}`, T = any> =
    RT extends `${ResponseType.ARRAY_BUFFER}` ?
        ArrayBuffer :
        RT extends `${ResponseType.TEXT}` ?
            string :
            RT extends `${ResponseType.STREAM}` ?
                ReadableStream<Uint8Array> :
                RT extends `${ResponseType.BLOB}` ?
                    Blob :
                    T;
export interface Response<T = any > extends globalThis.Response {
    data?: T
}

export type ResponseTransformer = (data: any) => any;
