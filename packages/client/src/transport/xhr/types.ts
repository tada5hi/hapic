/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITransport } from '../types';

export type XhrTransportOptions = {
    /**
     * The transport for a request XMLHttpRequest cannot send: where no
     * XMLHttpRequest exists, or for a body it does not take (a stream).
     *
     * default: a FetchTransport.
     */
    fallback?: ITransport
};
