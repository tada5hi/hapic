/*
 * Copyright (c) 2022-2026.
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
    KeyValueV2VersionsPayload,
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
     * Soft delete the latest version of a secret.
     *
     * The version is no longer returned by reads, but its data is kept
     * and can be restored with undeleteVersions.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async delete(
        mount: string,
        path: string,
    ) : Promise<void> {
        await this.client.delete(`${mount}/data/${path}`);
    }

    /**
     * Permanently delete the metadata and all versions of a secret.
     *
     * This cannot be undone.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async deleteMetadata(
        mount: string,
        path: string,
    ) : Promise<void> {
        await this.client.delete(`${mount}/metadata/${path}`);
    }

    /**
     * Soft delete the given versions of a secret.
     *
     * The versions are no longer returned by reads, but their data is kept
     * and can be restored with undeleteVersions.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param versions The versions to delete.
     */
    async deleteVersions(
        mount: string,
        path: string,
        versions: number[],
    ) : Promise<void> {
        const payload : KeyValueV2VersionsPayload = { versions };

        await this.client.post(`${mount}/delete/${path}`, payload);
    }

    /**
     * Restore soft deleted versions of a secret.
     *
     * Destroyed versions cannot be restored.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param versions The versions to restore.
     */
    async undeleteVersions(
        mount: string,
        path: string,
        versions: number[],
    ) : Promise<void> {
        const payload : KeyValueV2VersionsPayload = { versions };

        await this.client.post(`${mount}/undelete/${path}`, payload);
    }

    /**
     * Permanently remove the data of the given versions of a secret.
     *
     * This cannot be undone; the version metadata is kept and marked as destroyed.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param versions The versions to destroy.
     */
    async destroyVersions(
        mount: string,
        path: string,
        versions: number[],
    ) : Promise<void> {
        const payload : KeyValueV2VersionsPayload = { versions };

        await this.client.put(`${mount}/destroy/${path}`, payload);
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
