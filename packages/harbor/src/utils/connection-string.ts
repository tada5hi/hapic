/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { splitConnectionString } from 'hapic';
import type { ConnectionOptions } from '../config';
import { ConnectionStringParseError } from '../error';

const FORMAT_HINT = 'Harbor connection string must be in the following format: user:password@host';

export function parseConnectionString(connectionString: string): ConnectionOptions {
    const { credentials, host } = splitConnectionString(connectionString, { message: FORMAT_HINT });

    const authParts = credentials.split(':');
    if (authParts.length !== 2) {
        throw new ConnectionStringParseError(FORMAT_HINT);
    }

    return {
        host,
        user: authParts[0],
        password: authParts[1],
    };
}
