/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from 'hapic';
import { BaseAPI } from '../base';
import type { CompactorDeletionRequestCancel, CompactorDeletionRequestCreate } from './types';

export class CompactorAPI extends BaseAPI {
    /**
     * Create a new delete request.
     *
     * @throws Error
     * @param params
     */
    async createDeletionRequest(
        params: CompactorDeletionRequestCreate,
    ) : Promise<void> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
        };

        await this.client.post(
            'loki/api/v1/delete',
            {},
            {
                ...(this.options.compactorURL ? { baseURL: this.options.compactorURL } : {}),
                params,
                headers,
            },
        );
    }

    /**
     * Cancel a specific delete request.
     *
     * @throws Error
     * @param params
     */
    async cancelDeletionRequest(
        params: CompactorDeletionRequestCancel,
    ) : Promise<void> {
        const headers : Record<string, string> = {
            [HeaderName.CONTENT_TYPE]: 'application/json',
        };

        await this.client.delete(
            'loki/api/v1/delete',
            {
                ...(this.options.compactorURL ? { baseURL: this.options.compactorURL } : {}),
                params,
                headers,
            },
        );
    }
}
