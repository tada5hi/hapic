/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ResponseType } from '../../constants';

const JSON_REGEX = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;

export function detectResponseType(input?: string | null) : ResponseType {
    if (typeof input !== 'string' || input.length === 0) {
        return ResponseType.STREAM;
    }

    const contentType = input.split(';').shift() || '';

    if (JSON_REGEX.test(contentType)) {
        return ResponseType.JSON;
    }

    const textTypes = [
        'image/svg',
        'application/xml',
        'application/xhtml',
        'application/html',
    ];

    if (textTypes.indexOf(contentType) !== -1 || contentType.startsWith('text/')) {
        return ResponseType.TEXT;
    }

    return ResponseType.JSON;
}
