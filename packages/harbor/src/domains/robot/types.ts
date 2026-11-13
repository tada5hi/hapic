/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../types';
import type { RobotPermissionAction, RobotPermissionResource } from './constants';

export type RobotPermissionAccess = {
    resource: `${RobotPermissionResource}`,
    action: `${RobotPermissionAction}`
};

export type RobotLevel = 'system' | 'project';

export type RobotPermission = {
    access: RobotPermissionAccess[],
    kind: RobotLevel,
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
    level?: RobotLevel,
    disable?: boolean,
    editable?: boolean,
    permissions?: RobotPermission[]
};

type RobotCollectionQuery = ResourceCollectionQuery<Robot>;

/**
 * Harbor selects project robots with the capitalised `Level` and
 * `ProjectID` keys (`q=Level=project,ProjectID=1`); without them
 * only system robots are listed.
 */
export type RobotQuery = Omit<RobotCollectionQuery, 'q'> & {
    q?: Omit<NonNullable<RobotCollectionQuery['q']>, 'level'> & {
        Level?: RobotLevel,
        ProjectID?: number
    }
};

export type RobotGetManyContext = {
    query?: RobotQuery
};

type RobotPayloadRequired = {
    name: string,
    level: RobotLevel,
    permissions: RobotPermission[]
};

/**
 * Harbor requires a level and at least one permission.
 */
export type RobotCreatePayload = Omit<Robot, 'id' | keyof RobotPayloadRequired> & RobotPayloadRequired;

/**
 * Harbor requires the unchanged name and level
 * and at least one permission.
 */
export type RobotUpdatePayload = RobotCreatePayload;

export type RobotUpdateSecretResponse = {
    secret: string
};
