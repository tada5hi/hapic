/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Blob, File, FormData } from '../fetch';

function kindOf(input: unknown) {
    return Object.prototype.toString.call(input)
        .slice(8, -1).toLowerCase();
}

function kindOfTest(type: string, input: unknown) {
    type = type.toLowerCase();

    return kindOf(input) === type;
}

export function isObject(input: unknown): input is Record<string, any> {
    return typeof input === 'object' &&
        input !== null &&
        !!input &&
        !Array.isArray(input);
}

export function isStream(input: unknown) : boolean {
    return isObject(input) &&
        typeof input.pipe === 'function';
}

export function isFormData(input: unknown) : input is FormData {
    if (
        typeof FormData !== 'undefined' &&
        input instanceof FormData
    ) {
        return true;
    }

    const pattern = '[object FormData]';
    if (Object.prototype.toString.call(input) === pattern) {
        return true;
    }

    return !!input && typeof input.toString === 'function' && input.toString() === pattern;
}

export function isArrayBuffer(input: unknown) : input is ArrayBuffer {
    if (
        typeof ArrayBuffer !== 'undefined' &&
        input instanceof ArrayBuffer
    ) {
        return true;
    }

    return kindOfTest('ArrayBuffer', input);
}

export function isFile(input: unknown) : input is File {
    if (
        typeof File !== 'undefined' &&
        input instanceof File
    ) {
        return true;
    }

    return kindOfTest('File', input);
}

export function isBlob(input: unknown) : input is Blob {
    if (
        typeof Blob !== 'undefined' &&
        input instanceof Blob
    ) {
        return true;
    }

    return kindOfTest('Blob', input);
}

export function isURLSearchParams(input: unknown) {
    if (
        typeof URLSearchParams !== 'undefined' &&
        input instanceof URLSearchParams
    ) {
        return true;
    }

    return kindOfTest('URLSearchParams', input);
}
