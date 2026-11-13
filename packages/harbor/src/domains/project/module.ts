/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientErrorWithStatusCode } from 'hapic';
import { HeaderName } from '../../constants';
import { extractResourceIDOfResponse, extractResourceNameOfResponse } from '../../utils';
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
    ProjectCreateOptions,
    ProjectCreatePayload,
    ProjectCreateResponse,
    ProjectGetManyOptions,
    ProjectMetadata,
    ProjectMetadataName,
    ProjectMetadataWritableName,
    ProjectSummary,
    ProjectUpdatePayload,
} from './types';

export class ProjectAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    /**
     * Create a project. With `resourceNameInLocation`, Harbor puts the
     * project name instead of its id into the `Location` header,
     * so the result carries `name` instead of `id`.
     */
    async create(
        data: ProjectCreatePayload,
        options: ProjectCreateOptions = {},
    ) : Promise<ProjectCreateResponse> {
        if (options.resourceNameInLocation) {
            const response = await this.client.post('projects', data, { headers: { [HeaderName.RESOURCE_NAME_IN_LOCATION]: 'true' } });

            return { name: extractResourceNameOfResponse(response) };
        }

        const response = await this.client
            .post('projects', data);

        return { id: extractResourceIDOfResponse(response) };
    }

    /**
     * Check if a project with the given name exists.
     * Only a 404 response maps to `false`; any other error is thrown.
     */
    async exists(name: string) : Promise<boolean> {
        try {
            await this.client.head(buildRequestPath(['projects'], { project_name: name }));

            return true;
        } catch (e) {
            if (isClientErrorWithStatusCode(e, 404)) {
                return false;
            }

            throw e;
        }
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

    async getSummary(
        id: string | number,
        isProjectName = false,
    ) : Promise<ProjectSummary> {
        const { data } = await this.client
            .get(buildRequestPath(['projects', id, 'summary']), withResourceName(isProjectName));

        return data;
    }

    // -----------------------------------------------------------------------------------

    async getMetadata(
        id: string | number,
        isProjectName = false,
    ) : Promise<Partial<ProjectMetadata>> {
        // the swagger route is declared with a trailing slash
        const { data } = await this.client
            .get(buildRequestPath(['projects', id, 'metadatas', '']), withResourceName(isProjectName));

        return data;
    }

    async getMetadataItem(
        id: string | number,
        name: ProjectMetadataName,
        isProjectName = false,
    ) : Promise<Partial<ProjectMetadata>> {
        const { data } = await this.client
            .get(buildRequestPath(['projects', id, 'metadatas', name]), withResourceName(isProjectName));

        return data;
    }

    /**
     * Add one metadata key; Harbor accepts exactly one key per request.
     */
    async addMetadata(
        id: string | number,
        name: ProjectMetadataWritableName,
        value: string,
        isProjectName = false,
    ) : Promise<void> {
        await this.client.post(
            buildRequestPath(['projects', id, 'metadatas', '']),
            { [name]: value },
            withResourceName(isProjectName),
        );
    }

    async updateMetadata(
        id: string | number,
        name: ProjectMetadataWritableName,
        value: string,
        isProjectName = false,
    ) : Promise<void> {
        await this.client.put(
            buildRequestPath(['projects', id, 'metadatas', name]),
            { [name]: value },
            withResourceName(isProjectName),
        );
    }

    async deleteMetadata(
        id: string | number,
        name: ProjectMetadataName,
        isProjectName = false,
    ) : Promise<void> {
        await this.client
            .delete(buildRequestPath(['projects', id, 'metadatas', name]), withResourceName(isProjectName));
    }
}
