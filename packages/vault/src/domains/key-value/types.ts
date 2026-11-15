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

/**
 * Engine level settings that apply to every key of a mount.
 */
export type KeyValueV2Config = {
    /**
     * Number of versions to keep per key; 0 keeps 10.
     */
    max_versions: number,
    /**
     * Require the cas option on every write.
     */
    cas_required: boolean,
    /**
     * Duration string after which a version is deleted, "0s" disables it.
     */
    delete_version_after: string
};

export type KeyValueV2ConfigPayload = Partial<KeyValueV2Config>;

/**
 * Who performed an operation on a secret version.
 */
export type KeyValueV2Attribution = {
    actor?: string,
    operation?: string,
    entity_id?: string,
    client_id?: string
};

export type KeyValueV2MetadataVersion = {
    created_time: string,
    deletion_time: string,
    destroyed: boolean,
    created_by?: KeyValueV2Attribution | null,
    deleted_by?: KeyValueV2Attribution | null
};

/**
 * Version-agnostic metadata of a secret.
 */
export type KeyValueV2Metadata = {
    cas_required: boolean,
    created_time: string,
    current_version: number,
    delete_version_after: string,
    max_versions: number,
    oldest_version: number,
    updated_time: string,
    custom_metadata: Record<string, string> | null,
    /**
     * Keyed by version number.
     */
    versions: Record<string, KeyValueV2MetadataVersion>,
    last_updated_by?: KeyValueV2Attribution | null
};

export type KeyValueV2MetadataPayload = {
    max_versions?: number,
    cas_required?: boolean,
    delete_version_after?: string,
    custom_metadata?: Record<string, string>
};

export type KeyValueV2SubkeysOptions = {
    /**
     * Version to read; the latest version when not set.
     */
    version?: number,
    /**
     * Deepest nesting level to return; no limit when not set.
     */
    depth?: number
};

export type KeyValueV2Subkeys = {
    /**
     * The secret data with every leaf value replaced by null.
     */
    subkeys: Record<string, any> | null,
    metadata: KeyValueV2VersionMetadata
};
