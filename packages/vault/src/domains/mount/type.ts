/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { KeyValueVersion, MountType } from './constants';

export type MountCreatePayloadOptions = {
    version?: KeyValueVersion
};

export type MountCreatePayloadConfig = {
    default_lease_ttl?: string
    max_lease_ttl?: string,
    force_no_cache?: boolean,
    audit_non_hmac_request_keys?: string[],
    audit_non_hmac_response_keys?: string[],
    listing_visibility?: string,
    passthrough_request_headers?: string[],
    allowed_response_headers?: string[],
    plugin_version?: string
};

export type MountUpdatePayload = Omit<
MountCreatePayloadConfig,
'allowed_response_headers'
> & {
    description?: string,
    allowed_managed_keys?: string[],
};

export type MountCreatePayload = {
    type: `${MountType}`,
    description?: string,
    config?: MountCreatePayloadConfig,
    options?: MountCreatePayloadOptions,
    generate_signing_key?: boolean
};

export type MountCreateContext = {
    path: string,
    data: MountCreatePayload
};
