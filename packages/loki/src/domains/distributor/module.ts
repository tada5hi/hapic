/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { BaseAPI } from '../base';
import type { DistributorPushStream } from './types';

export class DistributorAPI extends BaseAPI {
    // -----------------------------------------------------------------------------------

    /**
     * Push multiple streams to the API.
     *
     * @throws Error
     * @param streams
     */
    async push(
        streams: DistributorPushStream[],
    ) : Promise<void> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
        };

        await this.client.post(
            'loki/api/v1/push',
            { streams },
            {
                ...(this.options.distributorURL ? { baseURL: this.options.distributorURL } : {}),
                headers,
            },
        );
    }

    /**
     * Push single stream to the API.
     *
     * @param stream
     */
    async pushStream(stream: DistributorPushStream) : Promise<void> {
        return this.push([stream]);
    }
}
