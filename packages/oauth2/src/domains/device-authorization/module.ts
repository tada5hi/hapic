/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI } from '../base';
import type { TokenBaseOptions } from '../token';
import {
    buildRequestOptionsForTokenAPIRequest,
    buildRequestTransformersForTokenAPIRequest,
    buildURLSearchParamsForTokenAPIRequest,
    extendClientAuthenticationParameters,
} from '../token/utils/request-options';
import type { DeviceAuthorizationParameters, DeviceAuthorizationResponse } from './types';

export class DeviceAuthorizationAPI extends BaseAPI {
    /**
     * Start a device authorization (RFC 8628 3.1, 3.2).
     *
     * Show the `user_code` and `verification_uri` of the response to the user,
     * then poll the token endpoint with `token.pollWithDeviceCode()`.
     *
     * @throws Error
     * @param parameters
     * @param options
     */
    async create(
        parameters: DeviceAuthorizationParameters = {},
        options: TokenBaseOptions = {},
    ): Promise<DeviceAuthorizationResponse> {
        if (!parameters.scope && this.options.scope) {
            parameters.scope = this.options.scope;
        }

        extendClientAuthenticationParameters(parameters, this.options);

        const { data } = await this.client.post(
            this.options.deviceAuthorizationEndpoint || '/device_authorization',
            buildURLSearchParamsForTokenAPIRequest(parameters),
            buildRequestOptionsForTokenAPIRequest(
                buildRequestTransformersForTokenAPIRequest(this.client, this.options, parameters, options),
                options,
            ),
        );

        const response : DeviceAuthorizationResponse = {
            device_code: data.device_code,
            user_code: data.user_code,
            verification_uri: data.verification_uri,
            expires_in: data.expires_in,
        };

        if (typeof data.verification_uri_complete === 'string') {
            response.verification_uri_complete = data.verification_uri_complete;
        }

        if (typeof data.interval === 'number') {
            response.interval = data.interval;
        }

        return response;
    }
}
