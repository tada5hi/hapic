/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { merge } from 'smob';
import { buildQueryString, extractResourceMetaOfResponse } from '../../utils';
import { BaseAPI } from '../base';
import type { BaseAPIContext, ResourceCollectionResponse } from '../type';
import type {
    Robot,
    RobotCreatePayload,
    RobotGetManyContext,
    RobotUpdatePayload,
    RobotUpdateSecretResponse,
} from './type';

export class RobotAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(data: RobotCreatePayload) : Promise<Robot> {
        const response = await this.client
            .post('robots', this.extendPayload(data));

        return merge(response.data, data);
    }

    async getMany(context: RobotGetManyContext) : Promise<ResourceCollectionResponse<Robot>> {
        const response = await this.client.get(`robots${buildQueryString(context.query)}`);

        return {
            data: response.data,
            meta: extractResourceMetaOfResponse(response),
        };
    }

    async getOne(id: number) : Promise<Robot> {
        const response = await this.client.get(`robots/${id}`);

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
        const payload: Record<string, any> = {
            ...(secret ? { secret } : {}),
        };

        const { data }: { data: Robot } = await this.client
            .patch(`robots/${id}`, payload);

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
            .put(`robots/${id}`, this.extendPayload({ ...data, id }));
    }

    async delete(id: Robot['id']): Promise<void> {
        await this.client
            .delete(`robots/${id}`);
    }

    extendPayload<T extends Record<string, any>>(data: T) : T {
        return merge((data || {}), {
            description: '',
            duration: -1,
            level: 'system',
            editable: true,
            disable: false,
            permissions: [],
        } satisfies Partial<Robot>) as T;
    }
}
