/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, markInstanceof } from 'hapic';
import type { ConfigInput } from './config';
import { CompactorAPI, DistributorAPI, QuerierAPI } from './domains';

export const LOKI_CLIENT_INSTANCE = Symbol.for('@hapic/loki/LokiClient');

export class LokiClient extends Client {
    public readonly compactor: CompactorAPI;

    public readonly distributor: DistributorAPI;

    public readonly querier : QuerierAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        const request = { ...input.request };
        request.baseURL ||= 'http://localhost:3100/';

        super(request);

        markInstanceof(this, LOKI_CLIENT_INSTANCE);

        this.compactor = new CompactorAPI({ client: this, options: input.options });
        this.distributor = new DistributorAPI({ client: this, options: input.options });
        this.querier = new QuerierAPI({ client: this, options: input.options });
    }
}
