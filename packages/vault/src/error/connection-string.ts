/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// The connection-string error now lives in the base `hapic` package so the
// shared parser can throw it and every client recognises the same type.
// Re-exported here to keep `@hapic/vault`'s public error surface stable.
export {
    CONNECTION_STRING_PARSE_ERROR_INSTANCE,
    ConnectionStringParseError,
    isConnectionStringParseError,
} from 'hapic';
