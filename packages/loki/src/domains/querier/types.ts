/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QuerierQueryDirection } from './constants';

export type QuerierQueryOptions = {
    /**
     * The LogQL query to perform.
     */
    query: string,

    /**
     * The maximum number of entries to return.
     *
     * default: 100
     */
    limit?: number,

    /**
     * The evaluation time for the query as a nanosecond Unix epoch.
     *
     * default: now
     */
    time?: bigint | string,

    /**
     * Determines the sort order of logs.
     *
     * default: backward
     */
    direction?: `${QuerierQueryDirection}`
};

export type QuerierQueryRangeOptions = Omit<QuerierQueryOptions, 'time'> & {
    /**
     * The start time for the query as a nanosecond Unix epoc
     *
     * default: -1h
     */
    start?: bigint | string,

    /**
     * The end time for the query as a nanosecond Unix epoch
     *
     * default: now
     */
    end?: bigint | string,

    /**
     * Prometheus' duration strings of the form [0-9]+[smhdwy]
     */
    step?: string,

    /**
     *  Only return entries at (or greater than) the specified interval,
     *  can be a duration format or float number of seconds
     */
    interval?: number
};

export type QuerierQueryVectorResult = {
    resultType: 'vector',
    result: {
        metric: {
            [key: string]: any
        },
        value: [
            string,
            string,
        ][]
    }[],
    stats : Record<string, any>
};

export type QuerierQueryStreamsResult = {
    resultType: 'streams',
    result: {
        stream: {
            [key: string]: any
        },
        value: [
            string,
            string,
        ][]
    }[],
    stats : Record<string, any>
};

export type QuerierQueryResult = {
    status: 'success' | 'error',
    data: QuerierQueryVectorResult | QuerierQueryStreamsResult
};
