/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'hapic';
import type { ConfigInput } from './config';
import { DistributorAPI } from './domains';
import { QuerierAPI } from './domains/querier';

export class LokiClient extends Client {
    override readonly '@instanceof' = Symbol.for('LokiClient');

    public readonly distributor: DistributorAPI;

    public readonly querier : QuerierAPI;

    // -----------------------------------------------------------------------------------

    constructor(input: ConfigInput = {}) {
        super(input.request);

        this.distributor = new DistributorAPI({ client: this, options: input.options });
        this.querier = new QuerierAPI({ client: this, options: input.options });
    }
}
