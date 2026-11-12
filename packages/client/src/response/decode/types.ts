/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from '../../constants';

export type ResponseDecodeOptions<RT extends `${ResponseType}` = `${ResponseType}`> = {
    /**
     * The desired response type; detected from the
     * Content-Type header when not set.
     */
    responseType?: RT
};
