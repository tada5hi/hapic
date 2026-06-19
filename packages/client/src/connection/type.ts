/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ConnectionStringParts = {
    /**
     * Everything before the `@` separator — the service-specific credential
     * segment (e.g. `user:password` for Basic auth, or a bare token).
     */
    credentials: string,
    /**
     * Everything after the `@` separator — the base URL the client targets.
     */
    host: string,
};

export type ConnectionStringSplitOptions = {
    /**
     * Error message used when the connection string is malformed.
     * Lets a service surface a format hint (e.g. `user:password@host`).
     */
    message?: string,
};

export type ConnectionConfigInput<T> = {
    connectionString?: string,
    connectionOptions?: T,
};
