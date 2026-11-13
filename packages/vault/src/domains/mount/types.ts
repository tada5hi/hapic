/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { KeyValueVersion, MountType } from './constants';

/**
 * A built-in secrets engine type or the name of a registered plugin.
 */
export type MountTypeInput = `${MountType}` | (string & {});

/**
 * Mount type specific options, passed to the backend as a string map.
 */
export type MountOptions = {
    /**
     * Version of a kv mount ("1" or "2").
     */
    version?: `${KeyValueVersion}`,
    [key: string]: string | undefined
};

export type MountCreatePayloadOptions = MountOptions;

export type MountCreatePayloadConfig = {
    /**
     * Duration string, e.g. "30m".
     */
    default_lease_ttl?: string,
    /**
     * Duration string, e.g. "30m".
     */
    max_lease_ttl?: string,
    force_no_cache?: boolean,
    audit_non_hmac_request_keys?: string[],
    audit_non_hmac_response_keys?: string[],
    /**
     * "unauth" or "hidden".
     */
    listing_visibility?: string,
    passthrough_request_headers?: string[],
    allowed_response_headers?: string[],
    plugin_version?: string,
    allowed_managed_keys?: string[],
    delegated_auth_accessors?: string[],
    identity_token_key?: string
};

export type MountCreatePayload = {
    type: MountTypeInput,
    description?: string,
    config?: MountCreatePayloadConfig,
    options?: MountCreatePayloadOptions,
    local?: boolean,
    seal_wrap?: boolean,
    external_entropy_access?: boolean
};

export type MountUpdatePayload = {
    /**
     * Seconds, or a duration string.
     */
    default_lease_ttl?: string | number,
    /**
     * Seconds, or a duration string.
     */
    max_lease_ttl?: string | number,
    description?: string,
    audit_non_hmac_request_keys?: string[],
    audit_non_hmac_response_keys?: string[],
    listing_visibility?: string,
    passthrough_request_headers?: string[],
    allowed_response_headers?: string[],
    allowed_managed_keys?: string[],
    plugin_version?: string,
    delegated_auth_accessors?: string[]
};

export type MountCreateContext = {
    path: string,
    data: MountCreatePayload
};

export type MountConfig = {
    /**
     * Seconds; 0 means the system default.
     */
    default_lease_ttl: number,
    /**
     * Seconds; 0 means the system default.
     */
    max_lease_ttl: number,
    force_no_cache: boolean,
    audit_non_hmac_request_keys?: string[],
    audit_non_hmac_response_keys?: string[],
    listing_visibility?: string,
    passthrough_request_headers?: string[],
    allowed_response_headers?: string[],
    allowed_managed_keys?: string[],
    identity_token_key?: string,
    delegated_auth_accessors?: string[],
    trim_request_trailing_slashes?: boolean
};

/**
 * A mounted secrets engine, as returned by GET /sys/mounts
 * and GET /sys/mounts/:path.
 */
export type Mount = {
    type: MountTypeInput,
    description: string,
    accessor: string,
    config: MountConfig,
    options: MountOptions | null,
    local: boolean,
    seal_wrap: boolean,
    external_entropy_access: boolean,
    uuid: string,
    plugin_version: string,
    running_plugin_version: string,
    running_sha256: string,
    /**
     * Only set for built-in engines, e.g. "supported" or "deprecated".
     */
    deprecation_status?: string
};

/**
 * Effective configuration of a mount, as returned by GET /sys/mounts/:path/tune.
 * TTLs are in seconds and already resolved to the system default where unset.
 */
export type MountTune = {
    description: string,
    default_lease_ttl: number,
    max_lease_ttl: number,
    force_no_cache: boolean,
    external_entropy_access?: boolean,
    audit_non_hmac_request_keys?: string[],
    audit_non_hmac_response_keys?: string[],
    listing_visibility?: string,
    passthrough_request_headers?: string[],
    allowed_response_headers?: string[],
    allowed_managed_keys?: string[],
    identity_token_key?: string,
    trim_request_trailing_slashes?: boolean,
    options?: MountOptions,
    plugin_version?: string
};
