/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ProjectArtifactLabel = {
    id: number,
    name: string,
    scope: string,
    update_time: string,
    creation_time: string
};

export type ProjectArtifactLabelCreateContext = {
    projectName: string,
    repositoryName: string,
    labelId: ProjectArtifactLabel['id'],
    tagOrDigest?: string,
};

export type ProjectArtifactLabelDeleteContext = {
    projectName: string,
    repositoryName: string,
    labelId: ProjectArtifactLabel['id'],
    tagOrDigest?: string,
};
