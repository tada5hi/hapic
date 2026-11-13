/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput } from 'hapic';

export type ConnectionOptions = {
    host: string,
    token: string,
    /**
     * Sent as X-Vault-Namespace header.
     */
    namespace?: string
};
export type Config = {
    request: ClientOptionsInput,
    connectionString?: string,
    connectionOptions?: ConnectionOptions
};

export type ConfigInput = Partial<Config>;
