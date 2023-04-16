/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI } from '../base';
import type { BaseAPIContext } from '../type';
import type {
    ProjectArtifactLabelCreateContext,
    ProjectArtifactLabelDeleteContext,
} from './type';

export class ProjectArtifactLabelAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(options: ProjectArtifactLabelCreateContext) : Promise<void> {
        await this.client
            .post(
                `projects/${options.projectName}/repositories/${options.repositoryName}` +
                `/artifacts/${options.tagOrDigest || 'latest'}/labels`,
                {
                    id: options.labelId,
                },
            );
    }

    async delete(options: ProjectArtifactLabelDeleteContext) {
        await this.client
            .delete(`projects/${options.projectName}/repositories/${options.repositoryName}` +
                `/artifacts/${options.tagOrDigest || 'latest'}/labels/${options.labelId}`);
    }
}
