/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import { isRequestError } from 'hapic';
import { merge } from 'smob';
import type {
    ProjectWebhook,
    ProjectWebhookDeleteOptions,
    ProjectWebhookFindOneOptions,
    ProjectWebhookSaveOptions,
} from './type';

export class ProjectWebHookAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async delete(options: ProjectWebhookDeleteOptions) : Promise<any> {
        const webhook = await this.findOne(options);

        if (typeof webhook !== 'undefined') {
            const response = await this.client
                .delete(`projects/${webhook.project_id}/webhook/policies/${webhook.id}`);

            return response.data;
        }

        return undefined;
    }

    async create(
        data: Partial<ProjectWebhook>,
        options: ProjectWebhookSaveOptions,
    ) : Promise<any> {
        const headers: Record<string, any> = {};

        if (options.isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const webhook: ProjectWebhook = this.buildWebhook(data);

        const response = await this.client
            .post(`projects/${options.projectIdOrName}/webhook/policies`, webhook, headers);

        return response.data;
    }

    async save(
        data: Partial<ProjectWebhook>,
        options: ProjectWebhookSaveOptions,
    ): Promise<any> {
        let response : any;

        try {
            response = await this.create(data, options);
        } catch (e) {
            if (
                isRequestError(e) &&
                e.response &&
                e.response.status === 409
            ) {
                await this.delete(options);
                response = await this.create(data, options);
            } else {
                throw e;
            }
        }

        return response;
    }

    async findOne(options: ProjectWebhookFindOneOptions): Promise<ProjectWebhook | undefined> {
        const headers: Record<string, any> = {};

        if (options.isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const { data } = await this.client
            .get(`projects/${options.projectIdOrName}/webhook/policies`, headers);

        if (!Array.isArray(data) || data.length === 0) {
            return undefined;
        }

        const index = data.findIndex((
            policy: { name: string; },
        ) => policy.name === options.name);

        if (index === -1) {
            return undefined;
        }

        return data[index];
    }

    protected buildWebhook(data: Partial<ProjectWebhook>) : ProjectWebhook {
        return merge(data, {
            name: (Math.random() + 1).toString(36).substring(7),
            enabled: true,
            targets: [],
            event_types: ['PUSH_ARTIFACT'],
        });
    }
}
