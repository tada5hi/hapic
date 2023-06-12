/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectArtifactLabel } from '../project-repository-artifact-label';
import type { ResourceCollectionQuery } from '../type';

export type ProjectArtifactTag = {
    artifact_id: number,
    id: number,
    immutable: boolean,
    name: string,
    pull_time: string,
    push_time: string,
    repository_id: number,
    signed: boolean
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
    project_id: number,
    repository_id: number,
};

export type ProjectArtifactGetManyQuery = ResourceCollectionQuery<ProjectArtifact> & {
    with_tag?: boolean,
    with_label?: boolean,
    with_scan_overview?: boolean,
    with_signature?: boolean,
    with_immutable_status?: boolean
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
