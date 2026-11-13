/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI } from '../base';
import {
    buildRepositoryPath,
    buildRequestPath,
    exactMatch,
    getAllPages,
    getCollection,
} from '../request';
import type { BaseAPIContext, ResourceCollectionResponse } from '../types';
import type {
    ProjectRepository,
    ProjectRepositoryDeleteContext,
    ProjectRepositoryFindOneContext,
    ProjectRepositoryGetManyContext,
    ProjectRepositoryGetOneContext,
    ProjectRepositoryUpdateContext,
} from './types';
import { parseLongProjectRepositoryName } from './utils';

export class ProjectRepositoryAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async findOne(projectRepositoryName: string): Promise<ProjectRepository | undefined>;

    async findOne(context: ProjectRepositoryFindOneContext): Promise<ProjectRepository | undefined>;

    async findOne(input: string | ProjectRepositoryFindOneContext): Promise<ProjectRepository | undefined> {
        let context : ProjectRepositoryDeleteContext;

        if (typeof input === 'string') {
            context = parseLongProjectRepositoryName(input);
        } else {
            context = input;
        }

        // An exact match on the full repository name, also for a name
        // Harbor would otherwise read as a substring or range match.
        const { data } = await this.getMany({
            projectName: context.projectName,
            query: {
                q: { name: exactMatch(`${context.projectName}/${context.repositoryName}`) },
                page_size: 1,
            },
        });

        return data.shift();
    }

    async getOne(projectRepositoryName: string) : Promise<ProjectRepository>;

    async getOne(context: ProjectRepositoryGetOneContext) : Promise<ProjectRepository>;

    async getOne(input: string | ProjectRepositoryGetOneContext) : Promise<ProjectRepository> {
        let context : ProjectRepositoryGetOneContext;

        if (typeof input === 'string') {
            context = parseLongProjectRepositoryName(input);
        } else {
            context = input;
        }

        const { data } : { data: ProjectRepository } = await this.client.get(
            buildRepositoryPath(context.projectName, context.repositoryName),
        );

        const parsed = parseLongProjectRepositoryName(data.name);

        return {
            ...data,
            name_short: parsed.repositoryName,
            project_name: parsed.projectName,
        };
    }

    async getMany(context: ProjectRepositoryGetManyContext): Promise<ResourceCollectionResponse<ProjectRepository>> {
        const response = await getCollection<ProjectRepository>(
            this.client,
            buildRequestPath(['projects', context.projectName, 'repositories'], context.query),
        );

        return {
            ...response,
            data: response.data.map((item) => {
                const parsed = parseLongProjectRepositoryName(item.name);

                return {
                    ...item,
                    name_short: parsed.repositoryName,
                    project_name: parsed.projectName,
                };
            }),
        };
    }

    async getAll(context: ProjectRepositoryGetManyContext) : Promise<ResourceCollectionResponse<ProjectRepository>> {
        return getAllPages(context.query, (query) => this.getMany({ ...context, query }));
    }

    async update(context: ProjectRepositoryUpdateContext) : Promise<void> {
        await this.client
            .put(buildRepositoryPath(context.projectName, context.repositoryName), context.data);
    }

    async delete(projectRepositoryName: string) : Promise<void>;

    async delete(context: ProjectRepositoryDeleteContext) : Promise<void>;

    async delete(input: string | ProjectRepositoryDeleteContext) : Promise<void> {
        let context : ProjectRepositoryDeleteContext;

        if (typeof input === 'string') {
            context = parseLongProjectRepositoryName(input);
        } else {
            context = input;
        }

        await this.client
            .delete(buildRepositoryPath(context.projectName, context.repositoryName));
    }
}
