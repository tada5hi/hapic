/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from './type-check';

/**
 * Traverse object or array and provide the ability to replace values.
 *
 * @param input
 * @param fn
 */
export function traverse<T extends Record<string, any> | unknown[]>(
    input: T,
    fn: (value: unknown, key: string) => unknown,
) {
    if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i++) {
            if (isObject(input[i]) || Array.isArray(input[i])) {
                input[i] = fn(traverse(input[i], fn), `${i}`);
                continue;
            }

            input[i] = fn(input[i], `${i}`);
        }

        return input;
    }

    const keys = Object.keys(input);
    for (const key of keys) {
        const value = input[key];

        if (isObject(value) || Array.isArray(value)) {
            input[key] = fn(traverse(value, fn), key);
            continue;
        }

        input[key] = fn(value, key);
    }

    return input;
}
