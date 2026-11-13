/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ResponseType } from 'hapic';
import { extractResourceIDOfResponse } from '../../utils';
import { BaseAPI } from '../base';
import { buildRequestPath, getCollection, withResourceName } from '../request';
import type { BaseAPIContext, ResourceCollectionResponse } from '../types';
import type {
    ProjectWebhookExecution,
    ProjectWebhookExecutionGetManyContext,
    ProjectWebhookExecutionTask,
    ProjectWebhookExecutionTaskGetManyContext,
    ProjectWebhookExecutionTaskLogContext,
    ProjectWebhookLastTrigger,
    ProjectWebhookLastTriggersContext,
    ProjectWebhookPolicy,
    ProjectWebhookPolicyCreateContext,
    ProjectWebhookPolicyCreateResponse,
    ProjectWebhookPolicyDeleteByNameContext,
    ProjectWebhookPolicyDeleteContext,
    ProjectWebhookPolicyFindOneContext,
    ProjectWebhookPolicyGetManyContext,
    ProjectWebhookPolicyGetOneContext,
    ProjectWebhookPolicyUpdateContext,
    ProjectWebhookSupportedEvents,
    ProjectWebhookSupportedEventsContext,
} from './types';

export class ProjectWebhookPolicyAPI extends BaseAPI {
    constructor(context: BaseAPIContext) {
        super(context);
    }

    async create(context: ProjectWebhookPolicyCreateContext) : Promise<ProjectWebhookPolicyCreateResponse> {
        const response = await this.client
            .post(
                buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'policies']),
                this.extendPayload(context.data, true),
                withResourceName(context.isProjectName),
            );

        return { id: extractResourceIDOfResponse(response) };
    }

    async getMany(context: ProjectWebhookPolicyGetManyContext) : Promise<ResourceCollectionResponse<ProjectWebhookPolicy>> {
        return getCollection(
            this.client,
            buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'policies'], context.query),
            withResourceName(context.isProjectName),
        );
    }

    async getOne(
        context: ProjectWebhookPolicyGetOneContext,
    ) : Promise<ProjectWebhookPolicy> {
        const response = await this.client
            .get(
                buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'policies', context.id]),
                withResourceName(context.isProjectName),
            );

        return response.data;
    }

    async findOne(context: ProjectWebhookPolicyFindOneContext): Promise<ProjectWebhookPolicy | undefined> {
        const response = await this.getMany({
            projectIdOrName: context.projectIdOrName,
            isProjectName: context.isProjectName,
            query: {
                q: { name: context.name },
                page_size: 1,
            },
        });

        return response.data.pop();
    }

    async update(context: ProjectWebhookPolicyUpdateContext): Promise<void> {
        await this.client.put(
            buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'policies', context.id]),
            this.extendPayload({
                ...context.data,
                id: context.id,
            }),
            withResourceName(context.isProjectName),
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
        await this.client
            .delete(
                buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'policies', context.id]),
                withResourceName(context.isProjectName),
            );
    }

    /**
     * Get the event types, notify types and payload formats Harbor supports.
     */
    async getSupportedEvents(context: ProjectWebhookSupportedEventsContext) : Promise<ProjectWebhookSupportedEvents> {
        const { data } = await this.client.get(
            buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'events']),
            withResourceName(context.isProjectName),
        );

        return data;
    }

    /**
     * Get the last trigger time of each policy and event type.
     * Deprecated upstream.
     */
    async getLastTriggers(context: ProjectWebhookLastTriggersContext) : Promise<ProjectWebhookLastTrigger[]> {
        const { data } = await this.client.get(
            buildRequestPath(['projects', context.projectIdOrName, 'webhook', 'lasttrigger']),
            withResourceName(context.isProjectName),
        );

        return data;
    }

    async getExecutions(
        context: ProjectWebhookExecutionGetManyContext,
    ) : Promise<ResourceCollectionResponse<ProjectWebhookExecution>> {
        return getCollection(
            this.client,
            buildRequestPath(
                ['projects', context.projectIdOrName, 'webhook', 'policies', context.id, 'executions'],
                context.query,
            ),
            withResourceName(context.isProjectName),
        );
    }

    async getExecutionTasks(
        context: ProjectWebhookExecutionTaskGetManyContext,
    ) : Promise<ResourceCollectionResponse<ProjectWebhookExecutionTask>> {
        return getCollection(
            this.client,
            buildRequestPath(
                ['projects', context.projectIdOrName, 'webhook', 'policies', context.id, 'executions', context.executionId, 'tasks'],
                context.query,
            ),
            withResourceName(context.isProjectName),
        );
    }

    /**
     * Get the log of a webhook task as plain text.
     */
    async getExecutionTaskLog(context: ProjectWebhookExecutionTaskLogContext) : Promise<string> {
        const { data } = await this.client.get(
            buildRequestPath([
                'projects',
                context.projectIdOrName,
                'webhook',
                'policies',
                context.id,
                'executions',
                context.executionId,
                'tasks',
                context.taskId,
                'log',
            ]),
            {
                ...withResourceName(context.isProjectName),
                responseType: ResponseType.TEXT,
            },
        );

        return data ?? '';
    }

    /**
     * Fill in `enabled` (and, on create, a random `name`) when absent.
     * Harbor replaces the whole policy on update and requires
     * `event_types` and `targets`, so those are sent as given.
     * The input is not modified.
     */
    protected extendPayload(
        data: Partial<ProjectWebhookPolicy>,
        withName = false,
    ) : Partial<ProjectWebhookPolicy> {
        const output = { ...data };

        if (withName && !output.name) {
            output.name = (Math.random() + 1).toString(36).substring(7);
        }

        if (typeof output.enabled === 'undefined') {
            output.enabled = true;
        }

        return output;
    }
}
