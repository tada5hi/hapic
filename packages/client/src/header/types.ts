/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Headers } from '../fetch';

/**
 * Any of the header container shapes hapic accepts: a `Headers` instance, an
 * array of `[key, value]` tuples, or a plain `Record<string, any>`.
 */
export type HeaderContainer = globalThis.HeadersInit | Headers;

/**
 * Options for {@link HeaderStore.merge}.
 */
export type HeaderMergeOptions = {
    /**
     * Overwrite keys that already exist in the target.
     *
     * default: true. Pass `false` to only fill in absent keys (used to lay
     * client defaults beneath per-request headers).
     */
    overwrite?: boolean
};
