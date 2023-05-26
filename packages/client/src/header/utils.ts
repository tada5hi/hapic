/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers } from '../fetch';

export function setHeader(
    headers: globalThis.HeadersInit | Headers,
    key: string,
    value: any,
) {
    key = key.toLowerCase();

    if (headers instanceof Headers) {
        headers.set(key, value);

        return;
    }

    if (Array.isArray(headers)) {
        const index = headers.findIndex((el) => el.length === 2 && el[0].toLowerCase() === key);
        if (index !== -1) {
            headers[index] = [key, value];
        } else {
            headers.push([key, value]);
        }
        return;
    }

    const keys = Object.keys(headers);
    const index = keys.findIndex((el) => el.toLowerCase() === key);
    if (index !== -1) {
        headers[keys[index]] = value;
    } else {
        headers[key] = value;
    }
}

export function getHeader(
    headers: globalThis.HeadersInit | Headers,
    key: string,
) : undefined | any {
    key = key.toLowerCase();

    if (headers instanceof Headers) {
        const value = headers.get(key);
        return value === null ? undefined : value;
    }

    if (Array.isArray(headers)) {
        const index = headers.findIndex((el) => el.length === 2 && el[0].toLowerCase() === key);
        if (index !== -1) {
            return headers[index][1];
        }

        return undefined;
    }

    const keys = Object.keys(headers);
    const index = keys.findIndex((el) => el.toLowerCase() === key);
    if (index !== -1) {
        return headers[keys[index]];
    }

    return undefined;
}

export function unsetHeader(
    headers: globalThis.HeadersInit | Headers,
    key: string,
) {
    key = key.toLowerCase();

    if (headers instanceof Headers) {
        headers.delete(key);
        return;
    }

    if (Array.isArray(headers)) {
        const index = headers.findIndex((el) => el.length === 2 && el[0].toLowerCase() === key.toLowerCase());
        if (index !== -1) {
            headers.splice(index, 1);
        }

        return;
    }

    const keys = Object.keys(headers);
    const index = keys.findIndex((el) => el.toLowerCase() === key);
    if (index !== -1) {
        delete headers[keys[index]];
    }
}
