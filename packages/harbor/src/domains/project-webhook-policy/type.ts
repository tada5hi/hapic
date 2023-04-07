/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../type';

export type ProjectWebhookEventType =
    'PUSH_ARTIFACT' |
    'PULL_ARTIFACT' |
    'DELETE_ARTIFACT' |
    'DELETE_CHART' |
    'DOWNLOAD_CHART' |
    'UPLOAD_CHART' |
    'QUOTA_EXCEEDED' |
    'QUOTA_WARNING' |
    'REPLICATION' |
    'SCANNING_FAILED' |
    'SCANNING_COMPLETED' |
    'TAG_RETENTION';

export type ProjectWebhookTarget = {
    address: string;
    auth_header?: string;
    skip_cert_verify: boolean;
    type: 'http';
};

export type ProjectWebhookPolicy = {
    creation_time?: string;
    description?: string;
    enabled: true;
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
