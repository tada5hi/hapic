/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type { ConfigInput, ConnectionOptions, SearchResult } from './type';
import { RobotAccountAPI } from './robot-account';
import { ProjectAPI } from './project';
import { ProjectWebHookAPI } from './project-webhook';
import { ProjectRepositoryAPI } from './project-repository';
import { ProjectArtifactAPI } from './project-artifact';
import { parseConnectionString } from './utils';

export class Client extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectArtifact: ProjectArtifactAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebHook: ProjectWebHookAPI;

    public readonly robotAccount : RobotAccountAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        input = input || {};

        super(input);

        let connectionConfig : ConnectionOptions | undefined;

        if (input.connectionString) {
            connectionConfig = parseConnectionString(input.connectionString);
        }

        if (input.connectionOptions) {
            connectionConfig = input.connectionOptions;
        }

        if (connectionConfig) {
            this.setBaseURL(connectionConfig.host);

            this.setAuthorizationHeader({
                type: 'Basic',
                username: connectionConfig.user,
                password: connectionConfig.password,
            });
        }

        this.project = new ProjectAPI(this.driver);
        this.projectArtifact = new ProjectArtifactAPI(this.driver);
        this.projectWebHook = new ProjectWebHookAPI(this.driver);
        this.projectRepository = new ProjectRepositoryAPI(this.driver);
        this.robotAccount = new RobotAccountAPI(this.driver);
    }

    // -----------------------------------------------------------------------------------

    async search(q: string): Promise<SearchResult> {
        const { data } = await this.driver
            .get(`search?q=${q}`);

        return data;
    }
}
