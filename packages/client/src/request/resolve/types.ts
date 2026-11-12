/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from '../../constants';
import type { RequestBaseOptions, RequestOptions } from '../types';

export type RequestResolveContext<RT extends `${ResponseType}` = `${ResponseType}`> = {
    /**
     * The client-wide request defaults (client.defaults).
     */
    defaults: RequestBaseOptions<RT>,
    /**
     * The client-wide default headers.
     */
    headers: Headers,
    /**
     * The per-request options.
     */
    config: RequestOptions<RT>
};
