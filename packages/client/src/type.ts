/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from './request';
import type { ITransport } from './transport';

/**
 * Fully-resolved options for a {@link Client}.
 */
export type ClientOptions = RequestBaseOptions & {
    /**
     * The transport used to dispatch requests.
     *
     * default: a `FetchTransport` bound to the cross-environment fetch.
     */
    transport: ITransport
};

/**
 * Options accepted when constructing a client. Everything is optional; the
 * transport defaults to a `FetchTransport`.
 */
export type ClientOptionsInput = Partial<ClientOptions>;
