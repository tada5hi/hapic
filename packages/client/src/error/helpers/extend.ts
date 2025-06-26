/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from '../../utils';

export function toError(input: unknown): Error | undefined {
    if (input instanceof Error) {
        return input;
    }

    if (isObject(input)) {
        if (input.constructor.name === 'TypeError') {
            Object.setPrototypeOf(input, TypeError.prototype);
            return input as TypeError;
        }

        const error = new Error(input.message);
        extendError(error, input);

        return input as Error;
    }

    return undefined;
}

export function extendError(error: Error, data: Record<string, any>) {
    const keys = Object.getOwnPropertyNames(data);
    for (let i = 0; i < keys.length; i++) {
        error[keys[i] as keyof Error] = data[keys[i]];
    }
}
