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
    for (let i = 0; i < keys.length; i++) {
        const value = input[keys[i]];
        if (isObject(value)) {
            const childKeys = Object.keys(value);
            if (childKeys.length > 0) {
                const childSearchParams = new URLSearchParams();
                for (let j = 0; j < childKeys.length; j++) {
                    childSearchParams.append(
                        childKeys[j],
                        `${encodeURIComponent(value[childKeys[j]])}`,
                    );
                }

                searchParams.append(keys[i], childSearchParams.toString());
            }
        } else if (Array.isArray(value)) {
            searchParams.append(keys[i], `${value.join(',')}`);
        } else {
            searchParams.append(keys[i], `${value}`);
        }
    }

    const queryString = searchParams.toString();
    if (queryString.length > 0 && withQuestionMark) {
        return `?${queryString}`;
    }

    return '';
}
