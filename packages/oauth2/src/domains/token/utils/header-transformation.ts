/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { stringifyAuthorizationHeader } from 'hapic';
import type { TokenBaseOptions } from '../type';

/**
 * Set Content-Type and Authorization Header for request.
 *
 * @param headers
 * @param options
 */
export function transformHeadersForTokenAPIRequest(
    headers: Headers,
    options?: TokenBaseOptions,
) : void {
    options = options || {};

    // set content type
    headers.set('Content-Type', 'application/x-www-form-urlencoded');

    if (
        options.authorizationHeaderInherit &&
        headers.has('Authorization')
    ) {
        return;
    }

    // request should be in general unauthorized
    headers.delete('Authorization');

    if (options.authorizationHeader) {
        const header = typeof options.authorizationHeader === 'string' ?
            options.authorizationHeader :
            stringifyAuthorizationHeader(options.authorizationHeader);

        headers.set('Authorization', header);

        return;
    }

    if (
        options.clientCredentialsAsHeader &&
        options.clientId &&
        options.clientSecret
    ) {
        headers.set('Authorization', stringifyAuthorizationHeader({
            type: 'Basic',
            username: options.clientId,
            password: options.clientSecret,
        }));
    }
}
