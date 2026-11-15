/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResourceCollectionQuery } from '../types';
import type { RobotPermissionAction, RobotPermissionResource } from './constants';

/**
 * Harbor reads an absent effect as `allow`
 * (src/pkg/permission/types/types.go).
 */
export type RobotPermissionEffect = 'allow' | 'deny';

export type RobotPermissionAccess = {
    resource: `${RobotPermissionResource}`,
    action: `${RobotPermissionAction}`,
    effect?: RobotPermissionEffect
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
    permissions?: RobotPermission[],
    /**
     * Who created the robot, e.g. `local` (a Harbor user) or `robot`.
     */
    creator_type?: string,
    /**
     * The id of the creator, e.g. the Harbor user id.
     */
    creator_ref?: number
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
export type RobotCreatePayload = Omit<Robot, 'id' | 'creator_type' | 'creator_ref' | keyof RobotPayloadRequired> & RobotPayloadRequired;

/**
 * Harbor requires the current `name` and `level` and at least one
 * permission. `name` is the name exactly as returned by `getOne` /
 * `getMany`, including its prefix (`robot$<name>` for a system robot,
 * `robot$<project>+<name>` for a project robot), not the name used
 * at create (server/v2.0/handler/robot.go `updateV2Robot`).
 */
export type RobotUpdatePayload = RobotCreatePayload;

export type RobotUpdateSecretResponse = {
    secret: string
};
