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

const gT = (function () {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof self !== 'undefined') {
        // eslint-disable-next-line no-restricted-globals
        return self;
    }

    if (typeof window !== 'undefined') {
        return window;
    }

    if (typeof global !== 'undefined') {
        return global;
    }

    throw new Error('unable to locate global object');
}());

export const File = gT.File ||
    _File;

export const FormData = gT.FormData ||
    _FormData;

export const AbortController = gT.AbortController ||
    _AbortController;

export const fetch = gT.fetch || nodeFetch;
export const Headers = gT.Headers || _Headers;
export const Blob = gT.Blob || _Blob;
