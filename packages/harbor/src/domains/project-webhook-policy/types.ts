/*
 * Copyright (c) 2022-2026.
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

type ProjectWebhookProjectContext = {
    projectIdOrName: number | string,
    isProjectName?: boolean,
};

/**
 * swagger `SupportedWebhookEventTypes`
 */
export type ProjectWebhookSupportedEvents = {
    event_type?: ProjectWebhookEventType[],
    notify_type?: ProjectWebhookNotifyType[],
    payload_formats?: {
        notify_type?: ProjectWebhookNotifyType,
        formats?: ProjectWebhookPayloadFormat[]
    }[]
};

/**
 * A policy and the last time it was triggered, per event type
 * (swagger `WebhookLastTrigger`).
 */
export type ProjectWebhookLastTrigger = {
    policy_name?: string,
    event_type?: ProjectWebhookEventType,
    enabled?: boolean,
    creation_time?: string,
    last_trigger_time?: string
};

/**
 * swagger `Metrics`
 */
export type ProjectWebhookExecutionMetrics = {
    task_count?: number,
    success_task_count?: number,
    error_task_count?: number,
    pending_task_count?: number,
    running_task_count?: number,
    scheduled_task_count?: number,
    stopped_task_count?: number
};

/**
 * swagger `Execution`
 */
export type ProjectWebhookExecution = {
    id?: number,
    vendor_type?: string,
    vendor_id?: number,
    status?: string,
    status_message?: string,
    metrics?: ProjectWebhookExecutionMetrics,
    trigger?: string,
    extra_attrs?: Record<string, unknown>,
    start_time?: string,
    end_time?: string
};

/**
 * swagger `Task`
 */
export type ProjectWebhookExecutionTask = {
    id?: number,
    execution_id?: number,
    status?: string,
    status_message?: string,
    run_count?: number,
    extra_attrs?: Record<string, unknown>,
    creation_time?: string,
    update_time?: string,
    start_time?: string,
    end_time?: string
};

export type ProjectWebhookSupportedEventsContext = ProjectWebhookProjectContext;

export type ProjectWebhookLastTriggersContext = ProjectWebhookProjectContext;

export type ProjectWebhookExecutionGetManyContext = ProjectWebhookProjectContext & {
    /**
     * The webhook policy id.
     */
    id: ProjectWebhookPolicy['id'],
    query?: ResourceCollectionQuery<ProjectWebhookExecution>
};

export type ProjectWebhookExecutionTaskGetManyContext = ProjectWebhookProjectContext & {
    /**
     * The webhook policy id.
     */
    id: ProjectWebhookPolicy['id'],
    executionId: number,
    query?: ResourceCollectionQuery<ProjectWebhookExecutionTask>
};

export type ProjectWebhookExecutionTaskLogContext = ProjectWebhookProjectContext & {
    /**
     * The webhook policy id.
     */
    id: ProjectWebhookPolicy['id'],
    executionId: number,
    taskId: number
};
