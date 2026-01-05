/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { BaseAPI } from '../base';
import type { QuerierQueryOptions, QuerierQueryResult } from './types';

export class QuerierAPI extends BaseAPI {
    /**
     * Query log database.
     *
     * * @throws Error
     * @param options
     */
    async query(options: QuerierQueryOptions): Promise<QuerierQueryResult> {
        const headers : Record<string, string> = {
            [HeaderName.ACCEPT]: 'application/json',
        };

        const { data } = await this.client.get(
            'select/logsql/query',
            {
                ...(this.options.querierURL ? { baseURL: this.options.querierURL } : {}),
                headers,
                params: options,
            },
        );

        return data;
    }
}
