/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MethodName } from '../constants';

/**
 * Whether a request of the given method may carry a body.
 * fetch refuses a body only for GET and HEAD, so every other method
 * (incl. DELETE and OPTIONS) sends a body that was set explicitly.
 */
export function isRequestPayloadSupported(method = 'GET') {
    method = method.toUpperCase();

    return method !== MethodName.GET &&
        method !== MethodName.HEAD;
}
