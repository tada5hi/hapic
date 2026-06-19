/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientRegistry } from 'hapic';
import type { ConfigInput } from './config';
import { VAULT_CLIENT_INSTANCE, VaultClient } from './module';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<VaultClient, ConfigInput>({
    create: (input) => new VaultClient(input),
    id: VAULT_CLIENT_INSTANCE,
});
