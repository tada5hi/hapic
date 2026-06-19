/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientRegistry } from 'hapic';
import type { ConfigInput } from './config';
import { HARBOR_CLIENT_INSTANCE, HarborClient } from './module';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<HarborClient, ConfigInput>({
    create: (input) => new HarborClient(input),
    id: HARBOR_CLIENT_INSTANCE,
});
