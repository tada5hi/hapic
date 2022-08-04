/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConnectionConfig } from '../type';
import { ConnectionStringParseError } from '../error';

export function parseConnectionString(connectionString: string): ConnectionConfig {
    const parts : string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new ConnectionStringParseError('Vault connection string must be in the following format: token@host');
    }

    return {
        host: parts[1],
        token: parts[0],
    };
}
