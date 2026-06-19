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
            const childKeys = Object.keys(value);
            if (childKeys.length > 0) {
                const childSearchParams = new URLSearchParams();
                for (const childKey of childKeys) {
                    childSearchParams.append(
                        childKey,
                        `${encodeURIComponent(value[childKey])}`,
                    );
                }

                searchParams.append(key, childSearchParams.toString());
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
