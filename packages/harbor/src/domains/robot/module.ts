/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { merge } from 'smob';
import { BaseAPI } from '../base';
import { buildRequestPath, getCollection } from '../request';
import type { BaseAPIContext, ResourceCollectionResponse } from '../types';
import type {
    Robot,
    RobotCreatePayload,
    RobotGetManyContext,
    RobotUpdatePayload,
    RobotUpdateSecretResponse,
} from './types';

export class RobotAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(data: RobotCreatePayload) : Promise<Robot> {
        const response = await this.client
            .post('robots', this.extendPayload(data));

        return merge(response.data, data);
    }

    async getMany(context: RobotGetManyContext) : Promise<ResourceCollectionResponse<Robot>> {
        return getCollection(this.client, buildRequestPath(['robots'], context.query));
    }

    async getOne(id: number) : Promise<Robot> {
        const response = await this.client.get(buildRequestPath(['robots', id]));

        return response.data;
    }

    /**
     * Update harbor project robot account.
     * If no "secret" provided, a new secret is generated.
     *
     * @param id
     * @param secret
     */
    async updateSecret(
        id: string | number,
        secret?: string,
    ): Promise<RobotUpdateSecretResponse> {
        const payload: Record<string, any> = { ...(secret ? { secret } : {}) };

        const { data }: { data: Robot } = await this.client
            .patch(buildRequestPath(['robots', id]), payload);

        if (typeof payload.secret !== 'undefined') {
            data.secret = payload.secret;
        }

        return data as RobotUpdateSecretResponse;
    }

    async update(
        id: number,
        data: RobotUpdatePayload,
    ): Promise<void> {
        await this.client
            .put(buildRequestPath(['robots', id]), { ...data, id });
    }

    async delete(id: Robot['id']): Promise<void> {
        await this.client
            .delete(buildRequestPath(['robots', id]));
    }

    /**
     * Set `duration` to `-1` (never expires) when absent:
     * Harbor rejects a create request without a valid duration.
     * The input is not modified.
     */
    extendPayload<T extends Record<string, any>>(data: T) : T {
        const output : Record<string, any> = { ...data };

        if (typeof output.duration === 'undefined' || output.duration === null) {
            output.duration = -1;
        }

        return output as T;
    }
}
