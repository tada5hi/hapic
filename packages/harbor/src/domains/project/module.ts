/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { extractResourceIDOfResponse } from '../../utils';
import { BaseAPI } from '../base';
import {
    buildRequestPath,
    getAllPages,
    getCollection,
    withResourceName,
} from '../request';
import type { BaseAPIContext, ResourceCollectionResponse } from '../types';
import type {
    Project,
    ProjectCreatePayload,
    ProjectCreateResponse,
    ProjectGetManyOptions,
    ProjectUpdatePayload,
} from './types';

export class ProjectAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(data: ProjectCreatePayload) : Promise<ProjectCreateResponse> {
        const response = await this.client
            .post('projects', data);

        return { id: extractResourceIDOfResponse(response) };
    }

    async delete(
        id: string | number,
        isProjectName = false,
    ) : Promise<void> {
        await this.client
            .delete(buildRequestPath(['projects', id]), withResourceName(isProjectName));
    }

    async update(
        id: number | string,
        data: ProjectUpdatePayload,
        isProjectName = false,
    ) : Promise<void> {
        await this.client
            .put(buildRequestPath(['projects', id]), data, withResourceName(isProjectName));
    }

    async getMany(options: ProjectGetManyOptions = {}) : Promise<ResourceCollectionResponse<Project>> {
        return getCollection(this.client, buildRequestPath(['projects'], options.query));
    }

    async getAll(options: ProjectGetManyOptions = {}) : Promise<ResourceCollectionResponse<Project>> {
        options.query = options.query || {};

        return getAllPages(options.query, (query) => this.getMany({ ...options, query }));
    }

    async getOne(
        id: string | number,
        isProjectName = false,
    ): Promise<Project> {
        const { data } = await this.client
            .get(buildRequestPath(['projects', id]), withResourceName(isProjectName));

        return data;
    }
}
