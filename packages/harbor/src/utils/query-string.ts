/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isObject } from 'smob';

export function buildQueryString(
    input?: Record<string, any>,
    withQuestionMark = true,
) {
    if (typeof input === 'undefined') {
        return '';
    }

    const searchParams = new URLSearchParams();

    const keys = Object.keys(input);

    for (const key of keys) {
        const value = input[key];

        if (isObject(value)) {
            // Harbor URL-decodes the `q` parameter once more after the
            // regular query decoding and only then splits it on `,` into
            // `key=value` pairs (lib/q/builder.go). So each pair is
            // form-encoded here and the joined string is form-encoded again
            // below. A `,` inside a value cannot be expressed.
            const pairs = Object.entries(value)
                .map(([childKey, childValue]) => new URLSearchParams([[childKey, `${childValue}`]]).toString());

            if (pairs.length > 0) {
                searchParams.append(key, pairs.join(','));
            }
        } else if (Array.isArray(value)) {
            searchParams.append(key, `${value.join(',')}`);
        } else {
            searchParams.append(key, `${value}`);
        }
    }

    const queryString = searchParams.toString();

    if (queryString.length > 0 && withQuestionMark) {
        return `?${queryString}`;
    }

    return '';
}
