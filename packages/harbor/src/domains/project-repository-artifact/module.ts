/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { HeaderName } from '../../constants';
import { BaseAPI } from '../base';
import { buildProjectRepositoryLongName } from '../project-repository';
import { buildRepositoryPath, getAllPages, getCollection } from '../request';
import type { BaseAPIContext, ResourceCollectionResponse } from '../types';
import type {
    ProjectArtifact,
    ProjectArtifactCopyElement,
    ProjectArtifactDeleteContext,
    ProjectArtifactGetManyContext,
    ProjectArtifactGetOneContext,
    ProjectArtifactTagContext,
} from './types';

/**
 * Request options sending `X-Accept-Vulnerabilities` when given.
 */
function withAcceptVulnerabilities(value?: string) : RequestBaseOptions {
    const headers: Record<string, any> = {};

    if (value) {
        headers[HeaderName.ACCEPT_VULNERABILITIES] = value;
    }

    return { headers };
}

export class ProjectRepositoryArtifactAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async getMany(context: ProjectArtifactGetManyContext) : Promise<ResourceCollectionResponse<ProjectArtifact>> {
        return getCollection(
            this.client,
            buildRepositoryPath(context.projectName, context.repositoryName, ['artifacts'], context.query),
            withAcceptVulnerabilities(context.acceptVulnerabilities),
        );
    }

    async getAll(context: ProjectArtifactGetManyContext) : Promise<ResourceCollectionResponse<ProjectArtifact>> {
        return getAllPages(context.query, (query) => this.getMany({ ...context, query }));
    }

    async getOne(context: ProjectArtifactGetOneContext) : Promise<ProjectArtifact> {
        const { data } = await this.client.get(
            buildRepositoryPath(
                context.projectName,
                context.repositoryName,
                ['artifacts', context.tagOrDigest || 'latest'],
                context.query,
            ),
            withAcceptVulnerabilities(context.acceptVulnerabilities),
        );

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

    async createTag(context: ProjectArtifactTagContext) : Promise<void> {
        await this.client.post(
            buildRepositoryPath(context.projectName, context.repositoryName, [
                'artifacts',
                context.tagOrDigest || 'latest',
                'tags',
            ]),
            { name: context.name },
        );
    }

    async deleteTag(context: ProjectArtifactTagContext) : Promise<void> {
        await this.client.delete(buildRepositoryPath(context.projectName, context.repositoryName, [
            'artifacts',
            context.tagOrDigest || 'latest',
            'tags',
            context.name,
        ]));
    }
}
