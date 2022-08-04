/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from 'hapic';
import { Repository } from './type';
import { parseProjectRepositoryName } from './utils';

export class ProjectRepositoryAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(projectName: string, repositoryName: string): Promise<Repository | undefined> {
        const { data } = await this.client.get(`projects/${projectName}/repositories?q=name=~${repositoryName}&=page_size=1`);

        if (data.length !== 1) {
            return undefined;
        }

        const item : Repository = data[0];

        const parsed = parseProjectRepositoryName(item.name);

        return {
            ...item,
            name_slim: parsed.repository_name,
            project_name: parsed.project_name,
        };
    }

    async getOne(projectName: string, repositoryName: string) : Promise<Repository> {
        const { data } : { data: Repository } = await this.client.get(`projects/${projectName}/repositories/${repositoryName}`);

        const parsed = parseProjectRepositoryName(data.name);

        return {
            ...data,
            name_slim: parsed.repository_name,
            project_name: parsed.project_name,
        };
    }

    async getMany(projectName: string): Promise<Repository[]> {
        const result = await this.client
            .get(`projects/${projectName}/repositories`);

        return result.data.map((item: Repository) => {
            const parsed = parseProjectRepositoryName(item.name);

            return {
                ...item,
                name_slim: parsed.repository_name,
                project_name: parsed.project_name,
            };
        });
    }

    async update(projectName: string, repositoryName: string, data: Partial<Repository>) {
        await this.client
            .put(`projects/${projectName}/repositories/${repositoryName}`, data);
    }

    async delete(projectName: string, repositoryName: string) : Promise<void> {
        await this.client
            .delete(`projects/${projectName}/repositories/${repositoryName}`);
    }
}
