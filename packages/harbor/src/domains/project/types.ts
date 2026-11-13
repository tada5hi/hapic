/*
 * Copyright (c) 2022.
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
    metadata: ProjectMetadata
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
    proxy_cache_local_on_not_found?: ProjectMetadataFlag
};

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

export type ProjectCreatePayload = {
    project_name: string,
    public?: boolean,
    registry_id?: string | number | null,
    storage_limit?: number
};

/**
 * Harbor applies only `metadata` and `cve_allowlist` on update;
 * metadata keys left out keep their value.
 */
export type ProjectUpdatePayload = {
    metadata?: Partial<ProjectMetadata>,
    cve_allowlist?: ProjectCVEAllowlist
};

export type ProjectCreateResponse = {
    id?: number
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
