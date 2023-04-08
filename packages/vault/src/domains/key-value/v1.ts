/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseAPIContext } from '../type';
import { BaseAPI } from '../base';
import type { ResourceResponse } from '../../type';
import type { KeyValueBaseContext, KeyValueV1CreateContext } from './type';

export class KeyValueV1API extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    async create(context: KeyValueV1CreateContext) : Promise<any> {
        const response = await this.driver.post(
            `${context.mount}/${context.path}`,
            context.data,
        );
        return response.data;
    }

    async getOne<T extends Record<string, any> = Record<string, any>>(
        context: KeyValueBaseContext,
    ) : Promise<ResourceResponse<T>> {
        const { data } = await this.driver.get(`${context.mount}/${context.path}`);

        return data;
    }

    async delete(context: KeyValueBaseContext) {
        await this.driver.delete(`${context.mount}/${context.path}`);
    }
}
