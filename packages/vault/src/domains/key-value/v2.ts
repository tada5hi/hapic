/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import { HeaderName } from '../../constants';
import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../types';
import type { ResourceResponse } from '../../types';
import type {
    KeyValueV2Config,
    KeyValueV2ConfigPayload,
    KeyValueV2CreateResponse,
    KeyValueV2GetOneResponse,
    KeyValueV2Metadata,
    KeyValueV2MetadataPayload,
    KeyValueV2Payload,
    KeyValueV2Subkeys,
    KeyValueV2SubkeysOptions,
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
     * Get a secret (version), or undefined if it does not exist.
     *
     * Vault answers 404 for a missing path, a path the token may not read,
     * and a deleted or destroyed version.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param version
     */
    async findOne<T extends Record<string, any> = Record<string, any>>(
        mount: string,
        path: string,
        version?: number,
    ) : Promise<KeyValueV2GetOneResponse<T> | undefined> {
        try {
            return await this.getOne<T>(mount, path, version);
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
            const { data } = await this.client.get(`${mount}/metadata/${path}`, { query: { list: true } });

            return data.data.keys;
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return [];
            }

            throw e;
        }
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
     * Read the engine configuration of a mount.
     *
     * @param mount The mount point on which the secret engine is mounted.
     */
    async getConfig(mount: string) : Promise<ResourceResponse<KeyValueV2Config>> {
        const { data } = await this.client.get(`${mount}/config`);

        return data;
    }

    /**
     * Write the engine configuration of a mount.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param data
     */
    async setConfig(mount: string, data: KeyValueV2ConfigPayload) : Promise<void> {
        await this.client.post(`${mount}/config`, data);
    }

    /**
     * Read the metadata and version list of a secret.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     */
    async getMetadata(mount: string, path: string) : Promise<ResourceResponse<KeyValueV2Metadata>> {
        const { data } = await this.client.get(`${mount}/metadata/${path}`);

        return data;
    }

    /**
     * Create or replace the metadata of a secret.
     * This does not create a new version.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param data
     */
    async saveMetadata(mount: string, path: string, data: KeyValueV2MetadataPayload) : Promise<void> {
        await this.client.post(`${mount}/metadata/${path}`, data);
    }

    /**
     * Read the key structure of a secret version, with every leaf value replaced by null.
     *
     * @param mount The mount point on which the secret engine is mounted.
     * @param path The secret path relative to the secret engine mount.
     * @param options
     */
    async getSubkeys(
        mount: string,
        path: string,
        options: KeyValueV2SubkeysOptions = {},
    ) : Promise<ResourceResponse<KeyValueV2Subkeys>> {
        const query : Record<string, number> = {};

        if (typeof options.version !== 'undefined') {
            query.version = options.version;
        }

        if (typeof options.depth !== 'undefined') {
            query.depth = options.depth;
        }

        const { data } = await this.client.get(`${mount}/subkeys/${path}`, { query });

        return data;
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
