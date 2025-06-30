/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'hapic';
import type { ConfigInput } from './config';
import { CompactorAPI, DistributorAPI, QuerierAPI } from './domains';

export class LokiClient extends Client {
    override readonly '@instanceof' = Symbol.for('LokiClient');

    public readonly compactor: CompactorAPI;

    public readonly distributor: DistributorAPI;

    public readonly querier : QuerierAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        input.request ||= {};
        input.request.baseURL = input.request.baseURL || 'http://localhost:3100/';

        super(input.request);

        this.compactor = new CompactorAPI({ client: this, options: input.options });
        this.distributor = new DistributorAPI({ client: this, options: input.options });
        this.querier = new QuerierAPI({ client: this, options: input.options });
    }
}
