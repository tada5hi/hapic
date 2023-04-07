/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import type {
    ProjectArtifact,
    ProjectArtifactCopyElement,
    ProjectArtifactDeleteOptions,
    ProjectArtifactGetManyOptions,
} from './type';

export class ProjectArtifactAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async getMany(options: ProjectArtifactGetManyOptions) : Promise<ProjectArtifact[]> {
        options.withTag = typeof options.withTag === 'boolean' ? options.withTag : true;
        options.withLabel = typeof options.withLabel === 'boolean' ? options.withLabel : true;

        const searchParams = new URLSearchParams();
        if (options.withTag) {
            searchParams.append('with_tag', 'true');
        }
        if (options.withLabel) {
            searchParams.append('with_label', 'true');
        }

        let qs = searchParams.toString();
        if (qs.length > 0) {
            qs = `?${qs}`;
        }
        const { data } = await this.client
            .get(`projects/${options.projectName}/repositories/${options.repositoryName}/artifacts${qs}`);

        return data;
    }

    async copy(
        destination: ProjectArtifactCopyElement,
        source: ProjectArtifactCopyElement,
    ) : Promise<void> {
        await this.client
            .post(
                `projects/${destination.projectName}/repositories/${destination.repositoryName}/artifacts?` +
                `from=${source.projectName}/${source.repositoryName}`,
            );
    }

    async delete(options: ProjectArtifactDeleteOptions) {
        await this.client
            .delete(`projects/${options.projectName}/repositories/${options.repositoryName}/artifacts/${options.tagOrDigest || 'latest'}`);
    }
}
