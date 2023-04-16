/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceResponse } from '../../type';
import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../type';
import type { MountCreateContext, MountCreatePayload } from './type';

export class MountAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    async create(context: MountCreateContext) {
        const { data, path } = context;
        data.options = data.options || {};
        data.config = data.config || {};
        const response = await this.client.post(`sys/mounts/${path}`, data);

        return response.data;
    }

    async getMany() : Promise<ResourceResponse<Record<string, MountCreatePayload>>> {
        const response = await this.client.get('sys/mounts');

        return response.data;
    }

    async getOne(path: string) : Promise<ResourceResponse<MountCreatePayload>> {
        const response = await this.client.get(`sys/mounts/${path}`);

        return response.data;
    }

    async delete(path: string) {
        await this.client.delete(`sys/mounts/${path}`);
    }
}
