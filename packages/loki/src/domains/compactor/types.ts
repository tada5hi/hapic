/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type CompactorDeletionRequestCreate = {
    /**
     * The LogQL query to perform.
     */
    query: string,

    /**
     * The start time for the query as a nanosecond Unix epoch
     */
    start: number | bigint | string,

    /**
     * The end time for the query as a nanosecond Unix epoch
     *
     * default: now
     */
    end?: number | bigint | string,
};

export type CompactorDeletionRequestCancel = {
    /**
     * Cancel a specific deletion request.
     */
    request_id: string | number | bigint,

    /**
     * When the force query parameter is true,
     * partially completed delete requests will be canceled.
     */
    force?: boolean
};
