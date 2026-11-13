/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from '../request';
import type { IClient } from '../types';

export type BaseAPIContext<
    OPTIONS extends Record<string, any> = Record<string, any>,
> = {
    /**
     * The client to issue requests through, or request options to
     * create a dedicated client from.
     */
    client?: IClient | RequestBaseOptions,
    /**
     * Domain options. The object is held by reference, so domain
     * objects constructed with the same object share it.
     */
    options?: OPTIONS,
};
