/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { merge } from 'smob';
import { HeaderName } from '../../constants';
import { buildQueryString, extractResourceIDOfResponse, extractResourceMetaOfResponse } from '../../utils';
import { BaseAPI } from '../base';
import type { BaseAPIContext, ResourceCollectionResponse } from '../type';
import type {
    ProjectWebhookEventType,
    ProjectWebhookPolicy,
    ProjectWebhookPolicyCreateContext,
    ProjectWebhookPolicyCreateResponse,
    ProjectWebhookPolicyDeleteByNameContext,
    ProjectWebhookPolicyDeleteContext,
    ProjectWebhookPolicyFindOneContext,
    ProjectWebhookPolicyGetManyContext,
    ProjectWebhookPolicyGetOneContext,
    ProjectWebhookPolicyUpdateContext,
} from './type';

export class ProjectWebhookPolicyAPI extends BaseAPI {
    // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-useless-constructor
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(context: ProjectWebhookPolicyCreateContext) : Promise<ProjectWebhookPolicyCreateResponse> {
        const headers: Record<string, any> = {};

        if (context.isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        const response = await this.client
            .post(
                `projects/${context.projectIdOrName}/webhook/policies`,
                this.extendPayload(context.data),
                headers,
            );

        return {
            id: extractResourceIDOfResponse(response),
        };
    }

    async getMany(context: ProjectWebhookPolicyGetManyContext) : Promise<ResourceCollectionResponse<ProjectWebhookPolicy>> {
        const headers: Record<string, any> = {};

        if (context.isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        const response = await this.client
            .get(
                `projects/${context.projectIdOrName}/webhook/policies${buildQueryString(context.query)}`,
                headers,
            );

        return {
            data: response.data,
            meta: extractResourceMetaOfResponse(response),
        };
    }

    async getOne(
        context: ProjectWebhookPolicyGetOneContext,
    ) : Promise<ProjectWebhookPolicy> {
        const headers: Record<string, any> = {};

        if (context.isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        const response = await this.client
            .get(
                `projects/${context.projectIdOrName}/webhook/policies/${context.id}`,
                headers,
            );

        return response.data;
    }

    async findOne(context: ProjectWebhookPolicyFindOneContext): Promise<ProjectWebhookPolicy | undefined> {
        const response = await this.getMany({
            projectIdOrName: context.projectIdOrName,
            isProjectName: context.isProjectName,
            query: {
                q: {
                    name: context.name,
                },
                page_size: 1,
            },
        });

        return response.data.pop();
    }

    async update(context: ProjectWebhookPolicyUpdateContext): Promise<void> {
        const headers: Record<string, any> = {};

        if (context.isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        await this.client.put(
            `projects/${context.projectIdOrName}/webhook/policies/${context.id}`,
            this.extendPayload({
                ...context.data,
                id: context.id,
            }),
            headers,
        );
    }

    async deleteByName(context: ProjectWebhookPolicyDeleteByNameContext) {
        const webhook = await this.findOne(context);
        if (webhook) {
            await this.delete({
                isProjectName: false,
                projectIdOrName: webhook.project_id as number,
                id: webhook.id,
            });
        }
    }

    async delete(context: ProjectWebhookPolicyDeleteContext) : Promise<any> {
        const headers: Record<string, any> = {};

        if (context.isProjectName) {
            headers[HeaderName.IS_RESOURCE_NAME] = true;
        }

        await this.client
            .delete(`projects/${context.projectIdOrName}/webhook/policies/${context.id}`, headers);
    }

    protected extendPayload(data: Partial<ProjectWebhookPolicy>) : Partial<ProjectWebhookPolicy> {
        data.name = data.name || (Math.random() + 1).toString(36).substring(7);

        if (typeof data.enabled === 'undefined') {
            data.enabled = true;
        }

        if (typeof data.targets === 'undefined') {
            data.targets = [];
        }

        if (typeof data.event_types === 'undefined') {
            data.event_types = ['PUSH_ARTIFACT'];
        } else {
            data.event_types = merge(['PUSH_ARTIFACT'] satisfies ProjectWebhookEventType[], data.event_types);
        }

        return data;
    }
}
