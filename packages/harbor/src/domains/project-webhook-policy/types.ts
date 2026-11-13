/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../types';

/**
 * Event types accepted by Harbor (pkg/notification/notification.go).
 */
export type ProjectWebhookEventType = 'PUSH_ARTIFACT' |
    'PULL_ARTIFACT' |
    'DELETE_ARTIFACT' |
    'QUOTA_EXCEED' |
    'QUOTA_WARNING' |
    'SCANNING_FAILED' |
    'SCANNING_STOPPED' |
    'SCANNING_COMPLETED' |
    'REPLICATION' |
    'TAG_RETENTION';

/**
 * Notify types accepted by Harbor (pkg/notification/notification.go).
 */
export type ProjectWebhookNotifyType = 'http' | 'slack';

/**
 * Payload formats of an `http` target; a `slack` target takes none
 * (pkg/notifier/formats). Harbor fills in `Default` for an `http` target.
 */
export type ProjectWebhookPayloadFormat = 'Default' | 'CloudEvents';

export type ProjectWebhookTarget = {
    address: string;
    auth_header?: string;
    skip_cert_verify: boolean;
    type: ProjectWebhookNotifyType;
    payload_format?: ProjectWebhookPayloadFormat;
};

export type ProjectWebhookPolicy = {
    creation_time?: string;
    creator?: string;
    description?: string;
    enabled: boolean;
    event_types: ProjectWebhookEventType[];
    id: number;
    name: string;
    project_id?: number;
    targets: ProjectWebhookTarget[];
    update_time?: string;
};

export type ProjectWebhookPolicyCreateContext = {
    data: Partial<ProjectWebhookPolicy>,
    projectIdOrName: number | string,
    isProjectName?: boolean,
};

export type ProjectWebhookPolicyCreateResponse = {
    id?: number
};

export type ProjectWebhookPolicyGetManyContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    query?: ResourceCollectionQuery<ProjectWebhookPolicy>
};

export type ProjectWebhookPolicyGetOneContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    id: number
};

export type ProjectWebhookPolicyFindOneContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    name : string,
};

export type ProjectWebhookPolicyDeleteContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    id: number
};

export type ProjectWebhookPolicyDeleteByNameContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    name : string,
};

export type ProjectWebhookPolicyUpdateContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
    id : ProjectWebhookPolicy['id'],
    data: Partial<ProjectWebhookPolicy>
};
