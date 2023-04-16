/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MethodName } from '../../constants';

export function isRequestPayloadSupported(method = 'GET') {
    method = method.toUpperCase();

    return method === MethodName.PATCH ||
        method === MethodName.POST ||
        method === MethodName.PUT;
}
