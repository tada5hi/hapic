/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type { ConfigInput, ConnectionOptions } from './config';
import type { SearchResult } from './type';
import {
    ProjectAPI,
    ProjectArtifactAPI,
    ProjectRepositoryAPI,
    RobotAccountAPI,
} from './domains';
import { ProjectWebHookAPI } from './domains/project-webhook';
import { parseConnectionString } from './utils';

export class Client extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectArtifact: ProjectArtifactAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebHook: ProjectWebHookAPI;

    public readonly robotAccount : RobotAccountAPI;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        super(input);

        this.project = new ProjectAPI(this.driver);
        this.projectArtifact = new ProjectArtifactAPI(this.driver);
        this.projectWebHook = new ProjectWebHookAPI(this.driver);
        this.projectRepository = new ProjectRepositoryAPI(this.driver);
        this.robotAccount = new RobotAccountAPI(this.driver);

        this.setConfig(input);
    }

    // -----------------------------------------------------------------------------------

    override setConfig(input?: ConfigInput) {
        super.setConfig(input);

        input = input || {};

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
    }

    // -----------------------------------------------------------------------------------

    async search(q: string): Promise<SearchResult> {
        const { data } = await this.driver
            .get(`search?q=${q}`);

        return data;
    }
}
