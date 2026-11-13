/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI } from '../base';
import { buildProjectRepositoryLongName } from '../project-repository';
import { buildRepositoryPath } from '../request';
import type { BaseAPIContext } from '../types';
import type {
    ProjectArtifact,
    ProjectArtifactCopyElement,
    ProjectArtifactDeleteContext,
    ProjectArtifactGetManyContext,
} from './types';

export class ProjectRepositoryArtifactAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async getMany(context: ProjectArtifactGetManyContext) : Promise<ProjectArtifact[]> {
        const { data } = await this.client
            .get(buildRepositoryPath(context.projectName, context.repositoryName, ['artifacts'], context.query));

        return data;
    }

    async copy(destination: ProjectArtifactCopyElement, source: string | ProjectArtifactCopyElement) : Promise<void> {
        let from : string;

        if (typeof source === 'string') {
            from = source;
        } else {
            from = buildProjectRepositoryLongName({
                ...source,
                ...(!source.artifactTag && !source.artifactDigest ? { artifactTag: 'latest' } : {}),
            });
        }

        await this.client
            .post(buildRepositoryPath(destination.projectName, destination.repositoryName, ['artifacts'], { from }));
    }

    async delete(context: ProjectArtifactDeleteContext) {
        await this.client
            .delete(buildRepositoryPath(context.projectName, context.repositoryName, [
                'artifacts',
                context.tagOrDigest || 'latest',
            ]));
    }
}
