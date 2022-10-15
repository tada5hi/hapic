/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient, Config } from 'hapic';
import { ConnectionConfig, SearchResult } from './type';
import { RobotAccountAPI } from './robot-account';
import { ProjectAPI } from './project';
import { ProjectWebHookAPI } from './project-webhook';
import { ProjectRepositoryAPI } from './project-repository';
import { ProjectArtifactAPI } from './project-artifact';
import { mergeDeep, parseConnectionString } from './utils';

export class Client extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectArtifact: ProjectArtifactAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebHook: ProjectWebHookAPI;

    public readonly robotAccount : RobotAccountAPI;

    // -----------------------------------------------------------------------------------

    constructor(config: Config) {
        let connectionConfig : ConnectionConfig | undefined;

        if (
            config.extra &&
            config.extra.connectionString
        ) {
            connectionConfig = parseConnectionString(config.extra.connectionString);
        }

        config.driver = mergeDeep({
            ...(connectionConfig ? { baseURL: connectionConfig.host } : {}),
            ...(config.driver || {}),
        });

        super(config);

        if (connectionConfig) {
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
