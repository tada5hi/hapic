/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConnectionStringParseError } from '../error';
import type {
    ConnectionConfigInput,
    ConnectionStringParts,
    ConnectionStringSplitOptions,
} from './type';

/**
 * Split a `<credentials>@<host>` connection string into its two structural
 * parts, throwing a {@link ConnectionStringParseError} when the `@` separator
 * is missing or ambiguous.
 *
 * This owns the part every service shares — the `@` split, the "exactly one
 * separator" rule, and the error type. Interpreting the `credentials` segment
 * (splitting `user:password`, treating it as a bare token, …) is left to each
 * service, since the credential shape is service-specific.
 *
 * @param input e.g. `"user:password@https://api.example.com/"`
 * @param options optional service-specific error message
 */
export function splitConnectionString(
    input: string,
    options: ConnectionStringSplitOptions = {},
): ConnectionStringParts {
    const parts = input.split('@');
    if (parts.length !== 2) {
        throw new ConnectionStringParseError(
            options.message ?? 'The connection string must be in the following format: credentials@host',
        );
    }

    return {
        credentials: parts[0],
        host: parts[1],
    };
}

/**
 * Resolve the effective connection options for a service config.
 *
 * An explicit `connectionOptions` always wins; otherwise the `connectionString`
 * is parsed via the service-supplied `parse` function. Checking the options
 * first means a `connectionString` that would only be overridden is never
 * parsed — so a malformed-but-overridden string can't throw. Returns
 * `undefined` when neither is provided (an empty `connectionString` is treated
 * as "not provided", matching env-var-driven config). This is the
 * connectionString → connectionOptions precedence every service client shares.
 */
export function resolveConnectionOptions<T>(
    input: ConnectionConfigInput<T>,
    parse: (connectionString: string) => T,
): T | undefined {
    if (input.connectionOptions) {
        return input.connectionOptions;
    }

    if (input.connectionString) {
        return parse(input.connectionString);
    }

    return undefined;
}
