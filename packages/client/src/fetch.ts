/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import nodeFetch, {
    AbortController as _AbortController,
    Blob as _Blob,
    File as _File,
    FormData as _FormData,
    Headers as _Headers,
} from 'node-fetch-native';
import type { ProxyOptions as ProxyOptionsBase } from 'node-fetch-native/proxy';
import { createProxy as createProxyBase } from 'node-fetch-native/proxy';
import { globalContext } from './utils/global-this.ts';

export const File = globalContext.File ||
    _File;

export const FormData = globalContext.FormData ||
    _FormData;

export const AbortController = globalContext.AbortController ||
    _AbortController;

export const fetch = globalContext.fetch || nodeFetch;
export const Headers = globalContext.Headers || _Headers;
export const Blob = globalContext.Blob || _Blob;

export type ProxyOptions = ProxyOptionsBase;

export function createProxy(options?: ProxyOptions) {
    return createProxyBase(options);
}
