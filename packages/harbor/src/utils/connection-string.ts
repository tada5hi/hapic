/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConnectionOptions } from '../type';
import { ConnectionStringParseError } from '../error';

export function parseConnectionString(connectionString: string): ConnectionOptions {
    const parts: string[] = connectionString.split('@');
    if (parts.length !== 2) {
        throw new ConnectionStringParseError('Harbor connection string must be in the following format: user:password@host');
    }

    const host: string = parts[1];

    const authParts: string[] = parts[0].split(':');
    if (authParts.length !== 2) {
        throw new ConnectionStringParseError('Harbor connection string must be in the following format: user:password@host');
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
    };
}
