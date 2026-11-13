/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectArtifactLabel } from '../project-repository-artifact-label';
import type { ResourceCollectionQuery } from '../types';

export type ProjectArtifactTag = {
    artifact_id: number,
    id: number,
    immutable: boolean,
    name: string,
    pull_time: string,
    push_time: string,
    repository_id: number
};

/**
 * swagger `Platform`
 */
export type ProjectArtifactPlatform = {
    architecture?: string,
    os?: string,
    'os.version'?: string,
    'os.features'?: string[],
    variant?: string
};

/**
 * A child of an image index (swagger `Reference`).
 */
export type ProjectArtifactReference = {
    parent_id?: number,
    child_id?: number,
    child_digest?: string,
    platform?: ProjectArtifactPlatform,
    annotations?: Record<string, string>,
    urls?: string[]
};

/**
 * swagger `AdditionLink`
 */
export type ProjectArtifactAdditionLink = {
    href?: string,
    absolute: boolean
};

/**
 * swagger `Scanner`
 */
export type ProjectArtifactScanner = {
    name?: string,
    vendor?: string,
    version?: string
};

/**
 * swagger `VulnerabilitySummary`
 */
export type ProjectArtifactVulnerabilitySummary = {
    total: number,
    fixable: number,
    /**
     * Number of vulnerabilities per severity, e.g. `{ Critical: 5 }`.
     */
    summary: Record<string, number>
};

/**
 * swagger `NativeReportSummary`
 */
export type ProjectArtifactNativeReportSummary = {
    report_id?: string,
    scan_status?: string,
    severity?: string,
    duration?: number,
    summary?: ProjectArtifactVulnerabilitySummary,
    start_time?: string,
    end_time?: string,
    complete_percent?: number,
    scanner?: ProjectArtifactScanner
};

/**
 * The scan overview, keyed by report MIME type (swagger `ScanOverview`).
 */
export type ProjectArtifactScanOverview = Record<string, ProjectArtifactNativeReportSummary>;

/**
 * swagger `SBOMOverview`
 */
export type ProjectArtifactSBOMOverview = {
    start_time?: string,
    end_time?: string,
    scan_status?: string,
    sbom_digest?: string,
    report_id?: string,
    duration?: number,
    scanner?: ProjectArtifactScanner
};

/**
 * A signature, SBOM or other accessory of an artifact (swagger `Accessory`).
 */
export type ProjectArtifactAccessory = {
    id?: number,
    artifact_id: number,
    /**
     * @deprecated use `subject_artifact_repo` and `subject_artifact_digest`
     */
    subject_artifact_id?: number,
    subject_artifact_digest: string,
    subject_artifact_repo: string,
    size: number,
    digest: string,
    type: string,
    icon: string,
    creation_time?: string
};

export type ProjectArtifact = {
    size: number,
    push_time: string,
    pull_time: string,
    tags?: ProjectArtifactTag[],
    labels?: ProjectArtifactLabel[],
    digest: string,
    id?: number,
    type: 'IMAGE' | 'CHART' | string,
    media_type?: string,
    manifest_media_type?: string,
    artifact_type?: string,
    project_id: number,
    repository_id: number,
    repository_name?: string,
    /**
     * The digest of the icon.
     */
    icon?: string,
    extra_attrs?: Record<string, unknown>,
    annotations?: Record<string, string>,
    references?: ProjectArtifactReference[],
    addition_links?: Record<string, ProjectArtifactAdditionLink>,
    scan_overview?: ProjectArtifactScanOverview,
    sbom_overview?: ProjectArtifactSBOMOverview,
    accessories?: ProjectArtifactAccessory[],
    /**
     * The signatures of the parent image index(es) referencing this artifact.
     * Only returned with `with_inherited_accessory: true`.
     */
    inherited_accessories?: ProjectArtifactAccessory[]
};

export type ProjectArtifactGetManyQuery = ResourceCollectionQuery<ProjectArtifact> & {
    with_tag?: boolean,
    with_label?: boolean,
    with_scan_overview?: boolean,
    with_sbom_overview?: boolean,
    with_immutable_status?: boolean,
    with_accessory?: boolean,
    with_inherited_accessory?: boolean
};

export type ProjectArtifactGetManyContext = {
    projectName: string,
    repositoryName: string,
    query?: ProjectArtifactGetManyQuery
};

export type ProjectArtifactDeleteContext = {
    projectName: string,
    repositoryName: string,
    tagOrDigest?: string
};

export type ProjectArtifactCopyElement = {
    projectName: string,
    repositoryName: string,
    artifactTag?: string
    artifactDigest?: string
};
