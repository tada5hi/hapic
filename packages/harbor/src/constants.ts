/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum HeaderName {
    LOCATION = 'location',
    IS_RESOURCE_NAME = 'X-Is-Resource-Name',
    TOTAL_COUNT = 'X-Total-Count',
    ACCEPT_VULNERABILITIES = 'X-Accept-Vulnerabilities',
    RESOURCE_NAME_IN_LOCATION = 'X-Resource-Name-In-Location',
    /**
     * Not set by any domain method: set it per client with `setHeader`
     * or per request in a request hook.
     */
    REQUEST_ID = 'X-Request-Id',
}
