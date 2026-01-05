/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type QuerierQueryOptions = {
    limit?: number,
    offset?: number,
    query: string,
    /**
     * Start date
     */
    start?: string,
    /**
     * End date
     */
    end?: string,

    /**
     * Timeout (e.g. 1s)
     */
    timeout?: string
};

export type QuerierQueryResultItem<
    T extends Record<string, string> = Record<string, string>,
> = {
    _msg: string,
    _time: string,
    _stream: string,
    _stream_id: string,
} & T;

export type QuerierQueryResult = QuerierQueryResultItem[];
