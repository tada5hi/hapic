/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type UserInfoOptions = {
    /**
     * Abort the current request with this signal.
     *
     * default: undefined
     */
    signal?: AbortSignal,

    /**
     * Abort the current request after this many milliseconds.
     * Overrides the client timeout.
     *
     * default: undefined (the client timeout)
     */
    timeout?: number
};
