/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueryString } from '../../utils';
import { BaseAPI } from '../base';
import { buildProjectRepositoryLongName } from '../project-repository';
import type { BaseAPIContext } from '../type';
import type {
    ProjectArtifact,
    ProjectArtifactCopyElement,
    ProjectArtifactDeleteContext,
    ProjectArtifactGetManyContext,
} from './type';

export class ProjectArtifactAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async getMany(context: ProjectArtifactGetManyContext) : Promise<ProjectArtifact[]> {
        const { data } = await this.client
            .get(`projects/${context.projectName}/repositories/${context.repositoryName}/artifacts${buildQueryString(context.query)}`);

        return data;
    }

    async copy(destination: ProjectArtifactCopyElement, source: string | ProjectArtifactCopyElement) : Promise<void> {
        let from : string;
        if (typeof source === 'string') {
            from = source;
        } else {
            if (!source.artifactTag && !source.artifactDigest) {
                source.artifactTag = 'latest';
            }

            from = buildProjectRepositoryLongName(source);
        }

        await this.client
            .post(
                `projects/${destination.projectName}/repositories/${destination.repositoryName}/artifacts?` +
                `from=${from}`,
            );
    }

    async delete(context: ProjectArtifactDeleteContext) {
        await this.client
            .delete(`projects/${context.projectName}/repositories/${context.repositoryName}/artifacts/${context.tagOrDigest || 'latest'}`);
    }
}
