/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { buildHref, toSearchParams } from '../../utils';
import { BaseAPI } from '../base';
import type { QuerierQueryOptions, QuerierQueryRangeOptions, QuerierQueryResult } from './types';

export class QuerierAPI extends BaseAPI {
    /**
     * Push multiple streams to the API.
     *
     * @see https://grafana.com/docs/loki/latest/reference/loki-http-api/?pg=oss-loki&plcmt=resources#query-logs-at-a-single-point-in-time
     * @throws Error
     * @param options
     */
    async query(options: QuerierQueryOptions): Promise<QuerierQueryResult> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
            [HeaderName.ACCEPT]: 'application/json',
        };

        const { data } = await this.client.get(
            buildHref('/loki/api/v1/query', this.options.querierURL),
            {
                headers,
                params: toSearchParams(options),
            },
        );

        return data;
    }

    // -----------------------------------------------------------------------------------

    /**
     * Push multiple streams to the API.
     *
     * @see https://grafana.com/docs/loki/latest/reference/loki-http-api/?pg=oss-loki&plcmt=resources#query-logs-within-a-range-of-time
     * @throws Error
     * @param options
     */
    async queryRange(options: QuerierQueryRangeOptions): Promise<QuerierQueryResult> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
            [HeaderName.ACCEPT]: 'application/json',
        };

        const { data } = await this.client.get(
            buildHref('/loki/api/v1/query_range', this.options.querierURL),
            {
                headers,
                params: toSearchParams(options),
            },
        );

        return data;
    }
}
