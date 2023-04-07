/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../type';

export type RobotPermissionAccess = {
    resource: 'artifact' |
    'artifact-label' |
    'helm-chart' |
    'helm-chart-version' |
    'repository' |
    'scan' |
    'tag',
    action: 'delete' | 'read' | 'create' | 'pull' | 'push' | 'list' | 'stop'
};

export type RobotPermission = {
    access: RobotPermissionAccess[],
    kind: 'project',
    namespace: string
};

export type Robot = {
    id: number,
    description?: string,
    name: string,
    secret?: string | null,
    creation_time?: string,
    update_time?: string,
    expires_at?: number,
    duration?: number,
    level?: 'system',
    disable?: boolean,
    editable?: boolean,
    permissions?: RobotPermission[]
};

export type RobotGetManyContext = {
    query?: ResourceCollectionQuery<Robot>
};

export type RobotCreatePayload = Omit<Robot, 'id'>;

export type RobotUpdatePayload = Omit<Robot, 'id'>;

export type RobotUpdateSecretResponse = {
    secret: string
};
