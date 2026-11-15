/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import type { BaseAPIContext } from '../types';
import { BaseAPI } from '../base';
import type { ResourceResponse } from '../../types';

export class KeyValueV1API extends BaseAPI {
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
     * Get a secret, or undefined if it does not exist.
     *
     * Vault also answers 404 when the token may not read the path.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async findOne<T extends Record<string, any> = Record<string, any>>(
        mount: string,
        path: string,
    ) : Promise<ResourceResponse<T> | undefined> {
        try {
            return await this.getOne<T>(mount, path);
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return undefined;
            }

            throw e;
        }
    }

    /**
     * List the keys at a path. Folders end with "/".
     *
     * An empty or missing folder returns an empty list.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The folder path relative to the secret engine mount; the mount root when empty.
     */
    async getKeys(mount: string, path = '') : Promise<string[]> {
        try {
            const { data } = await this.client.get(`${mount}/${path}`, { query: { list: true } });

            return data.data.keys;
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return [];
            }

            throw e;
        }
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
