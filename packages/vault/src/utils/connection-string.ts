/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { splitConnectionString } from 'hapic';
import type { ConnectionOptions } from '../config/type';

export function parseConnectionString(connectionString: string): ConnectionOptions {
    const { credentials, host } = splitConnectionString(connectionString, { message: 'Vault connection string must be in the following format: token@host' });

    return {
        host,
        token: credentials,
    };
}
