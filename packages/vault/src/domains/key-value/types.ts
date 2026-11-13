/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type KeyValueBaseContext = {
    /**
     * The mount point on which the secret
     * engine is mounted.
     */
    mount: string,
    /**
     * The secret path relative to the secret engine
     * mount.
     */
    path: string
};

export type KeyValueV2Payload = {
    options?: {
        cas?: number
    },
    data: Record<string, any>
};

export type KeyValueV2VersionsPayload = {
    versions: number[]
};

/**
 * Metadata of a single secret version.
 */
export type KeyValueV2VersionMetadata = {
    created_time: string,
    /**
     * Key metadata shared by all versions.
     */
    custom_metadata: Record<string, string> | null,
    /**
     * Empty string when no deletion is scheduled.
     */
    deletion_time: string,
    destroyed: boolean,
    version: number
};

export type KeyValueV2CreateResponse = {
    data: KeyValueV2VersionMetadata
};

export type KeyValueV2GetOneResponse<
    T extends Record<string, any> = Record<string, any>,
> = {
    data: {
        data: T,
        metadata: KeyValueV2VersionMetadata
    }
};
