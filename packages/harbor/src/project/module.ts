/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import { isRequestError } from 'hapic';
import type { Project, ProjectPayload } from './type';

export class ProjectAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async getMany() : Promise<Project[]> {
        const { data } = await this.client
            .get('projects');

        return data;
    }

    async getOne(id: string | number, isProjectName = false): Promise<Project> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const { data } = await this.client
            .get(`projects/${id}`);

        return data;
    }

    async save(payload: ProjectPayload) : Promise<void> {
        try {
            await this.client
                .post('projects', payload);
        } catch (e) {
            if (
                isClientError(e) &&
                e.response &&
                e.response.status === 409
            ) {
                const data = await this.getOne(payload.project_name, true);
                if (data) {
                    await this.update(data.project_id, payload);
                }
                return;
            }

            throw e;
        }
    }

    async create(data: ProjectPayload) : Promise<void> {
        await this.client
            .post('projects', data);
    }

    async update(id: Project['project_id'], data: ProjectPayload) : Promise<void> {
        await this.client
            .put(`projects/${id}`, data);
    }

    async delete(id: string | number, isProjectName = false) {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        await this.client
            .delete(`projects/${id}`, headers);
    }
}
