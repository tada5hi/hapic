/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../type';
import type {
    KeyValueBaseContext,
    KeyValueV2CreateContext,
    KeyValueV2CreateResponse,
    KeyValueV2GetOneResponse,
    KeyValueV2SaveContext,
    KeyValueV2UpdateContext,
} from './type';

export class KeyValueV2API extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    async create(context: KeyValueV2CreateContext) : Promise<KeyValueV2CreateResponse> {
        const response = await this.client.post(
            `${context.mount}/data/${context.path}`,
            context.data,
        );
        return response.data;
    }

    async getOne<T extends Record<string, any> = Record<string, any>>(
        context: KeyValueBaseContext,
    ) : Promise<KeyValueV2GetOneResponse<T>> {
        const { data } = await this.client.get(`${context.mount}/data/${context.path}`);

        return data;
    }

    async update(context: KeyValueV2UpdateContext) : Promise<any> {
        const response = await this.client.patch(
            `${context.mount}/data/${context.path}`,
            context.data,
        );
        return response.data;
    }

    async delete(context: KeyValueBaseContext) {
        await this.client.delete(`${context.mount}/metadata/${context.path}`);
    }

    async save(context: KeyValueV2SaveContext) : Promise<KeyValueV2CreateResponse> {
        return this.create(context);
    }
}
