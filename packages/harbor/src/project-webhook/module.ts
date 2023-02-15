/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientDriverInstance } from 'hapic';
import { isClientError } from 'hapic';
import type { ProjectWebhook } from './type';
import { mergeDeep } from '../utils';

export class ProjectWebHookAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(
        projectIdOrName: number | string,
        isProjectName: boolean,
        name : string,
    ): Promise<ProjectWebhook | undefined> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const { data } = await this.client
            .get(`projects/${projectIdOrName}/webhook/policies`, headers);

        const policies = data.filter((policy: { name: string; }) => policy.name === name);

        if (policies.length === 1) {
            return policies[0];
        }

        return undefined;
    }

    async save(
        projectIdOrName: number | string,
        isProjectName: boolean,
        data: Partial<ProjectWebhook>,
    ): Promise<ProjectWebhook> {
        const headers: Record<string, any> = {};

        if (isProjectName) {
            headers['X-Is-Resource-Name'] = true;
        }

        const webhook: ProjectWebhook = mergeDeep({
            name: (Math.random() + 1).toString(36).substring(7),
            enabled: true,
            targets: [],
            event_types: ['PUSH_ARTIFACT'],
        }, data);

        try {
            await this.client
                .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
        } catch (e) {
            if (
                isClientError(e) &&
                e.response &&
                e.response.status === 409
            ) {
                await this.delete(projectIdOrName, isProjectName, webhook.name);

                await this.client
                    .post(`projects/${projectIdOrName}/webhook/policies`, webhook, headers);
            } else {
                throw e;
            }
        }

        return webhook;
    }

    async delete(projectIdOrName: number | string, isProjectName: boolean, name: string) {
        const webhook = await this.find(projectIdOrName, isProjectName, name);

        if (typeof webhook !== 'undefined') {
            await this.client
                .delete(`projects/${webhook.project_id}/webhook/policies/${webhook.id}`);
        }
    }
}
