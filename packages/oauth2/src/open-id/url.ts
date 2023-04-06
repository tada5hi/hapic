/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function buildOpenIDDiscoveryURL(baseURL?: string) : string {
    let url = '.well-known/openid-configuration';

    if (baseURL) {
        url = new URL(url, baseURL).href;
    } else {
        url = `/${url}`;
    }

    return url;
}
