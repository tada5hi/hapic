/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientRegistry } from 'hapic';
import type { ConfigInput } from './config';
import { VICTORIALOGS_CLIENT_INSTANCE } from './constants';
import { VictoriaLogsClient } from './module';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<VictoriaLogsClient, ConfigInput>({
    create: (input) => new VictoriaLogsClient(input),
    id: VICTORIALOGS_CLIENT_INSTANCE,
});
