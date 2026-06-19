/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClientRegistry } from 'hapic';
import type { ConfigInput } from './config';
import { OAUTH2_CLIENT_INSTANCE, OAuth2Client } from './module';

export const {
    hasClient,
    setClient,
    useClient,
    unsetClient,
    createClient,
    isClient,
} = createClientRegistry<OAuth2Client, ConfigInput>({
    create: (input) => new OAuth2Client(input),
    id: OAUTH2_CLIENT_INSTANCE,
});
