/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, markInstanceof } from 'hapic';
import type { ConfigInput } from './config';
import { VICTORIALOGS_CLIENT_INSTANCE } from './constants';
import { IngestorAPI, QuerierAPI } from './domains';

export class VictoriaLogsClient extends Client {
    public readonly ingestor: IngestorAPI;

    public readonly querier : QuerierAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        input.request ||= {};
        input.request.baseURL = input.request.baseURL || 'http://localhost:9428/';

        super(input.request);

        markInstanceof(this, VICTORIALOGS_CLIENT_INSTANCE);

        this.ingestor = new IngestorAPI({ client: this, options: input.options });
        this.querier = new QuerierAPI({ client: this, options: input.options });
    }
}
