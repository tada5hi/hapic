/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName } from '../../constants';
import {
    buildQueryString,
    extractResourceIDOfResponse,
    extractResourceMetaOfResponse,
} from '../../utils';
import { BaseAPI } from '../base';
import type { BaseAPIContext, ResourceCollectionResponse } from '../type';
import type {
    Project,
    ProjectCreatePayload,
    ProjectCreateResponse,
    ProjectGetManyOptions,
    ProjectUpdatePayload,
} from './type';

export class ProjectAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(data: ProjectCreatePayload) : Promise<ProjectCreateResponse> {
        const response = await this.client
            .post('projects', data);

        return {
            id: extractResourceIDOfResponse(response),
        };
    }

    async delete(
        id: string | number,
        isProjectName = false,
    ) : Promise<void> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        await this.client
            .delete(`projects/${id}`, headers);
    }

    async update(
        id: number | string,
        data: ProjectUpdatePayload,
        isProjectName = false,
    ) : Promise<void> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        await this.client
            .put(`projects/${id}`, data, headers);
    }

    async getMany(options?: ProjectGetManyOptions) : Promise<ResourceCollectionResponse<Project>> {
        options = options || {};
        const response = await this.client
            .get(`projects${buildQueryString(options.query)}`);

        return {
            data: response.data,
            meta: extractResourceMetaOfResponse(response),
        };
    }

    async getOne(
        id: string | number,
        isProjectName = false,
    ): Promise<Project> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        const { data } = await this.client
            .get(`projects/${id}`, headers);

        return data;
    }
}
