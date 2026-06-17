/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput } from 'hapic';

export type Options = {
    compactorURL?: string,

    distributorURL?: string,

    ingesterURL?: string,

    indexGatewayURL?: string,

    querierURL?: string,

    querySchedulerURL?: string,

    rulerURL?: string,
};

export type Config = {
    request: ClientOptionsInput,
    connectionString: string,
    options: Options
};

export type ConfigInput = Partial<Config>;
