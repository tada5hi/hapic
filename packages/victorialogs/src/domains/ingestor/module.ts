/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { BaseAPI } from '../base';
import type { IngestorData } from './types';

export class IngestorAPI extends BaseAPI {
    /**
     * Push single stream to the API.
     *
     * @param data
     */
    async insert(data: IngestorData) : Promise<void> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
        };

        await this.client.post(
            '/insert/jsonline',
            data,
            {
                ...(this.options.ingesterURL ? { baseURL: this.options.ingesterURL } : {}),
                headers,
            },
        );
    }
}
