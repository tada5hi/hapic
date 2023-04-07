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

export class Client extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectArtifact: ProjectArtifactAPI;

    public readonly projectArtifactLabel : ProjectArtifactLabelAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebhookPolicy: ProjectWebhookPolicyAPI;

    public readonly robot : RobotAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        super(input);

        this.project = new ProjectAPI({ driver: this.driver });
        this.projectArtifact = new ProjectArtifactAPI({ driver: this.driver });
        this.projectArtifactLabel = new ProjectArtifactLabelAPI({ driver: this.driver });
        this.projectWebhookPolicy = new ProjectWebhookPolicyAPI({ driver: this.driver });
        this.projectRepository = new ProjectRepositoryAPI({ driver: this.driver });
        this.robot = new RobotAPI({ driver: this.driver });

        this.setConfig(input);
    }

    // -----------------------------------------------------------------------------------

    override setConfig(input?: ConfigInput) {
        super.setConfig(input);

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

        if (this.project) {
            this.project.setDriver(this.driver);
        }

        if (this.projectArtifact) {
            this.projectArtifact.setDriver(this.driver);
        }

        if (this.projectArtifactLabel) {
            this.projectArtifactLabel.setDriver(this.driver);
        }

        if (this.projectWebhookPolicy) {
            this.projectWebhookPolicy.setDriver(this.driver);
        }

        if (this.projectRepository) {
            this.projectRepository.setDriver(this.driver);
        }

        if (this.robot) {
            this.robot.setDriver(this.driver);
        }
    }

    // -----------------------------------------------------------------------------------

    async search(q: string): Promise<SearchResult> {
        const { data } = await this.driver
            .get(`search?q=${q}`);

        return data;
    }
}
