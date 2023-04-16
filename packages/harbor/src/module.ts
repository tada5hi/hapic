/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type { ConfigInput, ConnectionOptions } from './config';
import {
    ProjectAPI,
    ProjectArtifactAPI,
    ProjectArtifactLabelAPI,
    ProjectRepositoryAPI,
    ProjectWebhookPolicyAPI,
    RobotAPI,
} from './domains';
import type { SearchResult } from './type';
import { parseConnectionString } from './utils';

export class HarborClient extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectArtifact: ProjectArtifactAPI;

    public readonly projectArtifactLabel : ProjectArtifactLabelAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebhookPolicy: ProjectWebhookPolicyAPI;

    public readonly robot : RobotAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        input = input || {};

        super(input.request);

        this.project = new ProjectAPI({ client: this });
        this.projectArtifact = new ProjectArtifactAPI({ client: this });
        this.projectArtifactLabel = new ProjectArtifactLabelAPI({ client: this });
        this.projectWebhookPolicy = new ProjectWebhookPolicyAPI({ client: this });
        this.projectRepository = new ProjectRepositoryAPI({ client: this });
        this.robot = new RobotAPI({ client: this });

        this.applyConfig(input);
    }

    // -----------------------------------------------------------------------------------

    applyConfig(input?: ConfigInput) {
        input = input || {};

        let connectionOptions : ConnectionOptions | undefined;

        if (input.connectionString) {
            connectionOptions = parseConnectionString(input.connectionString);
        }

        if (input.connectionOptions) {
            connectionOptions = input.connectionOptions;
        }

        if (connectionOptions) {
            this.setBaseURL(connectionOptions.host);

            this.setAuthorizationHeader({
                type: 'Basic',
                username: connectionOptions.user,
                password: connectionOptions.password,
            });
        }
    }

    // -----------------------------------------------------------------------------------

    async search(q: string): Promise<SearchResult> {
        const { data } = await this
            .get(`search?q=${q}`);

        return data;
    }
}
