/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CLIENT_INSTANCE, Client } from './module';
import { createClientRegistry } from './registry';
import type { ClientOptionsInput } from './type';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<Client, ClientOptionsInput>({
    create: (input) => new Client(input),
    id: CLIENT_INSTANCE,
});
