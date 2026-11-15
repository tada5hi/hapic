/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../types';

export type Project = {
    name: string,
    project_id: number,
    owner_id: number,
    owner_name: string,
    registry_id?: number,
    repo_count: number,
    update_time: string,
    creation_time: string,
    /**
     * The deletion mark of the project.
     */
    deleted?: boolean,
    /**
     * Whether the publicity of the project can be changed (for the UI).
     */
    togglable?: boolean,
    /**
     * The role ids of the requesting user in this project (for the UI).
     */
    current_user_role_ids?: number[],
    metadata: ProjectMetadata,
    cve_allowlist?: ProjectCVEAllowlist
};

/**
 * A boolean project metadata value, sent as a string.
 */
export type ProjectMetadataFlag = 'true' | 'false';

/**
 * Project metadata. Every value is a string on the wire
 * (swagger `ProjectMetadata`).
 */
export type ProjectMetadata = {
    public: ProjectMetadataFlag,
    enable_content_trust?: ProjectMetadataFlag,
    enable_content_trust_cosign?: ProjectMetadataFlag,
    prevent_vul?: ProjectMetadataFlag,
    severity?: 'none' | 'low' | 'medium' | 'high' | 'critical',
    auto_scan?: ProjectMetadataFlag,
    auto_sbom_generation?: ProjectMetadataFlag,
    reuse_sys_cve_allowlist?: ProjectMetadataFlag,
    retention_id?: string,
    proxy_speed_kb?: string,
    max_upstream_conn?: string,
    proxy_cache_local_on_not_found?: ProjectMetadataFlag,
    /**
     * Proxy OCI 1.1 referrer API requests to the upstream registry
     * (proxy cache projects).
     */
    proxy_referrer_api?: ProjectMetadataFlag,
    /**
     * Only repositories matching the pattern are proxied; empty allows all
     * (proxy cache projects).
     */
    proxy_cache_filter_pattern?: string,
    /**
     * How `proxy_cache_filter_pattern` is matched; empty means `doublestar`
     * (proxy cache projects, src/lib/pattern).
     */
    proxy_cache_filter_kind?: 'doublestar' | 'regex' | ''
};

export type ProjectMetadataName = keyof ProjectMetadata;

/**
 * Metadata keys Harbor accepts on the metadata add and update endpoints
 * (`retention_id` is rejected there; server/v2.0/handler/project_metadata.go).
 */
export type ProjectMetadataWritableName = Exclude<ProjectMetadataName, 'retention_id'>;

export type ProjectCVEAllowlistItem = {
    cve_id: string
};

/**
 * The CVE allowlist of a project (swagger `CVEAllowlist`).
 */
export type ProjectCVEAllowlist = {
    id?: number,
    project_id?: number,
    expires_at?: number | null,
    items?: ProjectCVEAllowlistItem[],
    creation_time?: string,
    update_time?: string
};

/**
 * swagger `ProjectReq`
 */
export type ProjectCreatePayload = {
    project_name: string,
    /**
     * Copied into `metadata.public` by Harbor.
     */
    public?: boolean | null,
    metadata?: Partial<ProjectMetadata>,
    cve_allowlist?: ProjectCVEAllowlist,
    storage_limit?: number | null,
    /**
     * The upstream registry of a proxy cache project.
     */
    registry_id?: number | null,
    /**
     * Days since the last pull before a proxy cache artifact is removed
     * (`0` to `18250`); absent or `null` means seven days.
     * Only accepted for proxy cache projects.
     */
    retention_days?: number | null
};

/**
 * Harbor applies only `metadata` and `cve_allowlist` on update;
 * metadata keys left out keep their value.
 */
export type ProjectUpdatePayload = {
    metadata?: Partial<ProjectMetadata>,
    cve_allowlist?: ProjectCVEAllowlist
};

export type ProjectCreateOptions = {
    /**
     * Send `X-Resource-Name-In-Location: true`, so the response
     * carries the project name instead of the id.
     */
    resourceNameInLocation?: boolean
};

export type ProjectCreateResponse = {
    id?: number,
    name?: string
};

/**
 * Hard limits and usage of a project quota, e.g. `{ storage: 1024 }`
 * (swagger `ResourceList`).
 */
export type ProjectResourceList = Record<string, number>;

/**
 * The upstream registry of a proxy cache project (swagger `Registry`).
 */
export type ProjectSummaryRegistry = {
    id: number,
    url?: string,
    name?: string,
    credential?: {
        type?: string,
        access_key?: string,
        access_secret?: string
    },
    type?: string,
    insecure?: boolean,
    ca_certificate?: string | null,
    description?: string,
    status?: string,
    creation_time?: string,
    update_time?: string
};

/**
 * swagger `ProjectSummary`
 */
export type ProjectSummary = {
    repo_count: number,
    project_admin_count?: number,
    maintainer_count?: number,
    developer_count?: number,
    guest_count?: number,
    limited_guest_count?: number,
    quota?: {
        hard?: ProjectResourceList,
        used?: ProjectResourceList
    },
    registry?: ProjectSummaryRegistry
};

export type ProjectQuery = ResourceCollectionQuery<Project> & {
    name?: string,
    public?: boolean,
    owner?: string,
    with_detail?: boolean
};

export type ProjectGetManyOptions = {
    query?: ProjectQuery
};
