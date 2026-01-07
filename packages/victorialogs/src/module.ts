/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'hapic';
import type { ConfigInput } from './config';
import { CLIENT_INSTANCE_NAME } from './constants';
import { IngestorAPI, QuerierAPI } from './domains';

export class VictoriaLogsClient extends Client {
    override readonly '@instanceof' = Symbol.for(CLIENT_INSTANCE_NAME);

    public readonly ingestor: IngestorAPI;

    public readonly querier : QuerierAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        input.request ||= {};
        input.request.baseURL = input.request.baseURL || 'http://localhost:9428/';

        super(input.request);

        this.ingestor = new IngestorAPI({ client: this, options: input.options });
        this.querier = new QuerierAPI({ client: this, options: input.options });
    }
}
