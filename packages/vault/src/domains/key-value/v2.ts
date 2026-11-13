/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from '../../constants';
import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../types';
import type {
    KeyValueV2CreateResponse,
    KeyValueV2GetOneResponse,
    KeyValueV2Payload,
} from './types';

export class KeyValueV2API extends BaseAPI {
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
    async create(mount: string, path: string, data: KeyValueV2Payload) : Promise<KeyValueV2CreateResponse> {
        const response = await this.client.post(
            `${mount}/data/${path}`,
            data,
        );

        return response.data;
    }

    /**
     * Get a secret (version).
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param version
     */
    async getOne<T extends Record<string, any> = Record<string, any>>(
        mount: string,
        path: string,
        version?: number,
    ) : Promise<KeyValueV2GetOneResponse<T>> {
        const { data } = await this.client.get(`${mount}/data/${path}?version=${version || 0}`);

        return data;
    }

    /**
     * Update a secret.
     *
     * Vault only accepts a JSON merge patch for this endpoint,
     * so the request is sent with the content type application/merge-patch+json.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param data
     */
    async update(mount: string, path: string, data: KeyValueV2Payload) : Promise<KeyValueV2CreateResponse> {
        const response = await this.client.patch(
            `${mount}/data/${path}`,
            data,
            { headers: { [HeaderName.CONTENT_TYPE]: 'application/merge-patch+json' } },
        );

        return response.data;
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
        await this.client.delete(`${mount}/metadata/${path}`);
    }

    /**
     * Create or update a secret.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param data
     */
    async save(mount: string, path: string, data: KeyValueV2Payload) : Promise<KeyValueV2CreateResponse> {
        return this.create(mount, path, data);
    }
}
