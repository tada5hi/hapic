/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function toSearchParams(input: Record<string, any>) {
    const params = new URLSearchParams();

    const keys = Object.keys(input);
    for (let i = 0; i < keys.length; i++) {
        params.set(keys[i], `${input[keys[i]]}`);
    }

    return params;
}
