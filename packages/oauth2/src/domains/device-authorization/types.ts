/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientAuthenticationParameters } from '../token';

/**
 * Device authorization request (RFC 8628 3.1).
 */
export type DeviceAuthorizationParameters = {
    scope?: string | string[],
} & ClientAuthenticationParameters;

/**
 * Device authorization response (RFC 8628 3.2).
 */
export type DeviceAuthorizationResponse = {
    /**
     * The device verification code, to poll the token endpoint with.
     */
    device_code: string,

    /**
     * The end user verification code, to show to the user.
     */
    user_code: string,

    /**
     * The end user verification URI on the authorization server.
     */
    verification_uri: string,

    /**
     * The verification URI with the user code included.
     */
    verification_uri_complete?: string,

    /**
     * The lifetime of the device code and the user code in seconds.
     */
    expires_in: number,

    /**
     * The minimum number of seconds to wait between polling requests.
     */
    interval?: number,
};
