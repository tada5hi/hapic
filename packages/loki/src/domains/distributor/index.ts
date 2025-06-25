/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { buildHref } from '../../utils';
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
    ) : Promise<any> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
            [HeaderName.ACCEPT]: 'application/json',
        };

        const { data } = await this.client.post(
            buildHref('/loki/api/v1/push', this.options.distributorURL),
            {
                streams,
            },
            {
                headers,
            },
        );

        return data;
    }

    /**
     * Push single stream to the API.
     *
     * @param stream
     */
    async pushStream(stream: DistributorPushStream) : Promise<any> {
        return this.push([stream]);
    }
}
