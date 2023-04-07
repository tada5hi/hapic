/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import type {
    ProjectRepository,
    ProjectRepositoryDeleteOptions,
    ProjectRepositoryFindOneOptions,
    ProjectRepositoryGetManyOptions,
    ProjectRepositoryGetOneOptions,
    ProjectRepositoryUpdateOptions,
} from './type';
import { parseProjectRepositoryName } from './utils';

export class ProjectRepositoryAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async findOne(projectRepositoryName: string): Promise<ProjectRepository | undefined>;

    async findOne(options: ProjectRepositoryFindOneOptions): Promise<ProjectRepository | undefined>;

    async findOne(input: string | ProjectRepositoryFindOneOptions): Promise<ProjectRepository | undefined> {
        let options : ProjectRepositoryDeleteOptions;
        if (typeof input === 'string') {
            options = parseProjectRepositoryName(input);
        } else {
            options = input;
        }

        const { data } = await this.client.get(
            `projects/${options.projectName}/repositories?q=name=~${options.repositoryName}&=page_size=1`,
        );

        if (!Array.isArray(data) || data.length !== 1) {
            return undefined;
        }

        const item : ProjectRepository = data[0];

        const parsed = parseProjectRepositoryName(item.name);

        return {
            ...item,
            name_short: parsed.repositoryName,
            project_name: parsed.projectName,
        };
    }

    async getOne(options: ProjectRepositoryGetOneOptions) : Promise<ProjectRepository> {
        const { data } : { data: ProjectRepository } = await this.client.get(
            `projects/${options.projectName}/repositories/${options.repositoryName}`,
        );

        const parsed = parseProjectRepositoryName(data.name);

        return {
            ...data,
            name_short: parsed.repositoryName,
            project_name: parsed.projectName,
        };
    }

    async getMany(options: ProjectRepositoryGetManyOptions): Promise<ProjectRepository[]> {
        const result = await this.client
            .get(`projects/${options.projectName}/repositories`);

        return result.data.map((item: ProjectRepository) => {
            const parsed = parseProjectRepositoryName(item.name);

            return {
                ...item,
                name_short: parsed.repositoryName,
                project_name: parsed.projectName,
            };
        });
    }

    async update(projectRepositoryName: string, data: Partial<ProjectRepository>) : Promise<void>;

    async update(options: ProjectRepositoryUpdateOptions, data: Partial<ProjectRepository>) : Promise<void>;

    async update(input: string | ProjectRepositoryUpdateOptions, data: Partial<ProjectRepository>) : Promise<void> {
        let options : ProjectRepositoryDeleteOptions;
        if (typeof input === 'string') {
            options = parseProjectRepositoryName(input);
        } else {
            options = input;
        }

        await this.client
            .put(`projects/${options.projectName}/repositories/${options.repositoryName}`, data);
    }

    async delete(projectRepositoryName: string) : Promise<void>;

    async delete(options: ProjectRepositoryDeleteOptions) : Promise<void>;

    async delete(input: string | ProjectRepositoryDeleteOptions) : Promise<void> {
        let options : ProjectRepositoryDeleteOptions;
        if (typeof input === 'string') {
            options = parseProjectRepositoryName(input);
        } else {
            options = input;
        }

        await this.client
            .delete(`projects/${options.projectName}/repositories/${options.repositoryName}`);
    }
}
