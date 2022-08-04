/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance, isClientError } from 'hapic';
import { MountPayload } from './type';
import { MountType } from './constants';

export class MountAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async create(data: MountPayload<MountType.KEY_VALUE>) {
        const response = await this.client.post(`sys/mounts/${data.path}`, data);

        return response.data;
    }

    async delete(data: MountPayload<MountType.KEY_VALUE> | string) {
        const path : string = typeof data === 'string' ?
            data :
            data.path;

        try {
            await this.client.delete(`sys/mounts/${path}`);
        } catch (e) {
            if (
                isClientError(e) &&
                e.response &&
                e.response.status === 404
            ) {
                return;
            }

            throw e;
        }
    }
}
