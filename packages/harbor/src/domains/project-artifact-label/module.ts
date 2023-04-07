/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import type {
    ProjectArtifactLabel,
    ProjectArtifactLabelCreateOptions,
    ProjectArtifactLabelDeleteOptions,
} from './type';

export class ProjectArtifactLabelAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async create(
        data: ProjectArtifactLabel,
        options: ProjectArtifactLabelCreateOptions,
    ) : Promise<void> {
        await this.client
            .post(`projects/${options.projectName}/repositories/${options.repositoryName}` +
                `/artifacts/${options.tagOrDigest || 'latest'}/labels`, data);
    }

    async delete(id: number, options: ProjectArtifactLabelDeleteOptions) {
        await this.client
            .delete(`projects/${options.projectName}/repositories/${options.repositoryName}` +
                `/artifacts/${options.tagOrDigest || 'latest'}/labels/${id}`);
    }
}
