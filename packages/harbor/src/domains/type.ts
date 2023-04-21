/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, RequestBaseOptions } from 'hapic';

export type BaseAPIContext = {
    client?: Client | RequestBaseOptions,
};

export type ResourceCollectionResponse<R> = {
    data: R[],
    meta: {
        total?: number
    }
};

type SortString<T> = T extends string ?
    `${T}` | `-${T}` :
    never;

export type ResourceCollectionQuery<T extends Record<string, any> = Record<string, any>> = {
    q?: {
        [K in keyof T]?: any
    },
    page?: number,
    page_size?: number,
    sort?: SortString<keyof T>[]
};
