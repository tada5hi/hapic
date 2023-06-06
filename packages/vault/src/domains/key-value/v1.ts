/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseAPIContext } from '../type';
import { BaseAPI } from '../base';
import type { ResourceResponse } from '../../type';

export class KeyValueV1API extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context?: BaseAPIContext) {
        super(context);
    }

    /**
     * Create a secret.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param data
     */
    async create(mount: string, path: string, data: Record<string, any>) : Promise<any> {
        const response = await this.client.post(
            `${mount}/${path}`,
            data,
        );
        return response.data;
    }

    /**
     * Get a secret.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async getOne<T extends Record<string, any> = Record<string, any>>(
        mount: string,
        path: string,
    ) : Promise<ResourceResponse<T>> {
        const { data } = await this.client.get(`${mount}/${path}`);

        return data;
    }

    /**
     * Delete a secret.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async delete(
        mount: string,
        path: string,
    ) {
        await this.client.delete(`${mount}/${path}`);
    }
}
