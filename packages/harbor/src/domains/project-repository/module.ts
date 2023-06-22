/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueryString, extractResourceMetaOfResponse } from '../../utils';
import { BaseAPI } from '../base';
import type { BaseAPIContext, ResourceCollectionResponse } from '../type';
import type {
    ProjectRepository,
    ProjectRepositoryDeleteContext,
    ProjectRepositoryFindOneContext,
    ProjectRepositoryGetManyContext,
    ProjectRepositoryGetOneContext,
    ProjectRepositoryUpdateContext,
} from './type';
import { parseLongProjectRepositoryName } from './utils';

export class ProjectRepositoryAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
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

        const { data } = await this.getMany({
            projectName: context.projectName,
            query: {
                q: {
                    name: `~${context.repositoryName}`,
                },
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
            `projects/${context.projectName}/repositories/${context.repositoryName}`,
        );

        const parsed = parseLongProjectRepositoryName(data.name);

        return {
            ...data,
            name_short: parsed.repositoryName,
            project_name: parsed.projectName,
        };
    }

    async getMany(context: ProjectRepositoryGetManyContext): Promise<ResourceCollectionResponse<ProjectRepository>> {
        const result = await this.client
            .get(`projects/${context.projectName}/repositories${buildQueryString(context.query)}`);

        return {
            data: result.data
                .map((item: ProjectRepository) => {
                    const parsed = parseLongProjectRepositoryName(item.name);

                    return {
                        ...item,
                        name_short: parsed.repositoryName,
                        project_name: parsed.projectName,
                    };
                }),
            meta: extractResourceMetaOfResponse(result),
        };
    }

    async getAll(context: ProjectRepositoryGetManyContext) : Promise<ResourceCollectionResponse<ProjectRepository>> {
        context.query = context.query || {};

        if (!context.query.page_size) {
            context.query.page_size = 50;
        }

        if (!context.query.page) {
            context.query.page = 1;
        }

        const response = await this.getMany(context);
        if (response.data.length === context.query.page_size) {
            context.query.page++;

            const next = await this.getAll(context);

            response.data.push(...next.data);
        }

        return response;
    }

    async update(context: ProjectRepositoryUpdateContext) : Promise<void> {
        await this.client
            .put(`projects/${context.projectName}/repositories/${context.repositoryName}`, context.data);
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
            .delete(`projects/${context.projectName}/repositories/${context.repositoryName}`);
    }
}
