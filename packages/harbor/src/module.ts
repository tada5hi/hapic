/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient, markInstanceof, resolveConnectionOptions } from 'hapic';
import type { ConfigInput } from './config';
import {
    ProjectAPI,
    ProjectRepositoryAPI,
    ProjectRepositoryArtifactAPI,
    ProjectRepositoryArtifactLabelAPI,
    ProjectWebhookPolicyAPI,
    RobotAPI,
} from './domains';
import type { SearchResult } from './type';
import { parseConnectionString } from './utils';

export const HARBOR_CLIENT_INSTANCE = Symbol.for('@hapic/harbor/HarborClient');

export class HarborClient extends BaseClient {
    public readonly project: ProjectAPI;

    public readonly projectRepositoryArtifact: ProjectRepositoryArtifactAPI;

    public readonly projectRepositoryArtifactLabel : ProjectRepositoryArtifactLabelAPI;

    public readonly projectRepository: ProjectRepositoryAPI;

    public readonly projectWebhookPolicy: ProjectWebhookPolicyAPI;

    public readonly robot : RobotAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        super(input.request);

        markInstanceof(this, HARBOR_CLIENT_INSTANCE);

        this.project = new ProjectAPI({ client: this });
        this.projectRepository = new ProjectRepositoryAPI({ client: this });
        this.projectRepositoryArtifact = new ProjectRepositoryArtifactAPI({ client: this });
        this.projectRepositoryArtifactLabel = new ProjectRepositoryArtifactLabelAPI({ client: this });
        this.projectWebhookPolicy = new ProjectWebhookPolicyAPI({ client: this });
        this.robot = new RobotAPI({ client: this });

        this.applyConfig(input);
    }

    // -----------------------------------------------------------------------------------

    applyConfig(input: ConfigInput = {}) {
        const connectionOptions = resolveConnectionOptions(input, parseConnectionString);

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
