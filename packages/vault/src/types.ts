/*
 * Copyright (c) 2021-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Authentication information attached to a response
 * (e.g. on a login or token creation).
 */
export type ResourceResponseAuth = {
    client_token: string,
    accessor: string,
    policies: string[],
    token_policies?: string[],
    identity_policies?: string[],
    metadata: Record<string, string> | null,
    lease_duration: number,
    renewable: boolean,
    entity_id: string,
    token_type: string,
    orphan: boolean,
    mfa_requirement: Record<string, any> | null,
    num_uses: number
};

/**
 * Set when the response was wrapped in the cubbyhole
 * of a single-use token.
 */
export type ResourceResponseWrapInfo = {
    token: string,
    accessor: string,
    ttl: number,
    creation_time: string,
    creation_path: string,
    wrapped_accessor?: string
};

export type ResourceResponse<T extends Record<string, any> = Record<string, any>> = {
    auth?: ResourceResponseAuth | null,
    data: T,
    lease_duration: number,
    lease_id: string,
    mount_type?: string,
    renewable: boolean,
    request_id: string,
    warnings?: string[] | null,
    wrap_info?: ResourceResponseWrapInfo | null
};
