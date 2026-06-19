/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientRegistry } from 'hapic';
import type { ConfigInput } from './config';
import { LOKI_CLIENT_INSTANCE, LokiClient } from './module';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<LokiClient, ConfigInput>({
    create: (input) => new LokiClient(input),
    id: LOKI_CLIENT_INSTANCE,
});
