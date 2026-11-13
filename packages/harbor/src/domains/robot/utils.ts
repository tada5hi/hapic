/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RobotPermissionAction as Action, RobotPermissionResource as Resource } from './constants';
import type { RobotPermission, RobotPermissionAccess } from './types';

type Policy = [Resource, Action];

/**
 * PoliciesMap[ScopeProject] in src/common/rbac/const.go (Harbor v2.16.0).
 */
const PROJECT_POLICIES : Policy[] = [
    [Resource.LOG, Action.LIST],

    [Resource.PROJECT, Action.READ],
    [Resource.PROJECT, Action.DELETE],
    [Resource.PROJECT, Action.UPDATE],

    [Resource.METADATA, Action.READ],
    [Resource.METADATA, Action.CREATE],
    [Resource.METADATA, Action.DELETE],
    [Resource.METADATA, Action.LIST],
    [Resource.METADATA, Action.UPDATE],

    [Resource.REPOSITORY, Action.READ],
    [Resource.REPOSITORY, Action.UPDATE],
    [Resource.REPOSITORY, Action.DELETE],
    [Resource.REPOSITORY, Action.LIST],
    [Resource.REPOSITORY, Action.PULL],
    [Resource.REPOSITORY, Action.PUSH],

    [Resource.ARTIFACT, Action.READ],
    [Resource.ARTIFACT, Action.CREATE],
    [Resource.ARTIFACT, Action.LIST],
    [Resource.ARTIFACT, Action.DELETE],

    [Resource.SCAN, Action.CREATE],
    [Resource.SCAN, Action.READ],
    [Resource.SCAN, Action.STOP],

    [Resource.SBOM, Action.CREATE],
    [Resource.SBOM, Action.STOP],
    [Resource.SBOM, Action.READ],

    [Resource.TAG, Action.CREATE],
    [Resource.TAG, Action.LIST],
    [Resource.TAG, Action.DELETE],

    [Resource.ACCESSORY, Action.LIST],

    [Resource.ARTIFACT_ADDITION, Action.READ],

    [Resource.ARTIFACT_LABEL, Action.CREATE],
    [Resource.ARTIFACT_LABEL, Action.DELETE],

    [Resource.SCANNER, Action.CREATE],
    [Resource.SCANNER, Action.READ],

    [Resource.PREHEAT_POLICY, Action.READ],
    [Resource.PREHEAT_POLICY, Action.CREATE],
    [Resource.PREHEAT_POLICY, Action.DELETE],
    [Resource.PREHEAT_POLICY, Action.LIST],
    [Resource.PREHEAT_POLICY, Action.UPDATE],

    [Resource.IMMUTABLE_TAG, Action.CREATE],
    [Resource.IMMUTABLE_TAG, Action.DELETE],
    [Resource.IMMUTABLE_TAG, Action.LIST],
    [Resource.IMMUTABLE_TAG, Action.UPDATE],

    [Resource.NOTIFICATION_POLICY, Action.READ],
    [Resource.NOTIFICATION_POLICY, Action.CREATE],
    [Resource.NOTIFICATION_POLICY, Action.DELETE],
    [Resource.NOTIFICATION_POLICY, Action.LIST],
    [Resource.NOTIFICATION_POLICY, Action.UPDATE],

    [Resource.TAG_RETENTION, Action.READ],
    [Resource.TAG_RETENTION, Action.CREATE],
    [Resource.TAG_RETENTION, Action.DELETE],
    [Resource.TAG_RETENTION, Action.LIST],
    [Resource.TAG_RETENTION, Action.UPDATE],

    [Resource.LABEL, Action.READ],
    [Resource.LABEL, Action.CREATE],
    [Resource.LABEL, Action.DELETE],
    [Resource.LABEL, Action.LIST],
    [Resource.LABEL, Action.UPDATE],

    [Resource.QUOTA, Action.READ],
];

/**
 * PoliciesMap[ScopeSystem] in src/common/rbac/const.go (Harbor v2.16.0).
 */
const SYSTEM_POLICIES : Policy[] = [
    [Resource.AUDIT_LOG, Action.LIST],

    [Resource.PREHEAT_INSTANCE, Action.READ],
    [Resource.PREHEAT_INSTANCE, Action.CREATE],
    [Resource.PREHEAT_INSTANCE, Action.DELETE],
    [Resource.PREHEAT_INSTANCE, Action.LIST],
    [Resource.PREHEAT_INSTANCE, Action.UPDATE],

    [Resource.PROJECT, Action.LIST],
    [Resource.PROJECT, Action.CREATE],

    [Resource.REPLICATION_POLICY, Action.READ],
    [Resource.REPLICATION_POLICY, Action.CREATE],
    [Resource.REPLICATION_POLICY, Action.DELETE],
    [Resource.REPLICATION_POLICY, Action.LIST],
    [Resource.REPLICATION_POLICY, Action.UPDATE],

    [Resource.REPLICATION, Action.READ],
    [Resource.REPLICATION, Action.CREATE],
    [Resource.REPLICATION, Action.LIST],

    [Resource.REPLICATION_ADAPTER, Action.LIST],

    [Resource.REGISTRY, Action.READ],
    [Resource.REGISTRY, Action.CREATE],
    [Resource.REGISTRY, Action.DELETE],
    [Resource.REGISTRY, Action.LIST],
    [Resource.REGISTRY, Action.UPDATE],

    [Resource.SCAN_ALL, Action.READ],
    [Resource.SCAN_ALL, Action.UPDATE],
    [Resource.SCAN_ALL, Action.STOP],
    [Resource.SCAN_ALL, Action.CREATE],

    [Resource.SYSTEM_VOLUMES, Action.READ],

    [Resource.GARBAGE_COLLECTION, Action.READ],
    [Resource.GARBAGE_COLLECTION, Action.CREATE],
    [Resource.GARBAGE_COLLECTION, Action.LIST],
    [Resource.GARBAGE_COLLECTION, Action.UPDATE],
    [Resource.GARBAGE_COLLECTION, Action.STOP],

    [Resource.PURGE_AUDIT, Action.READ],
    [Resource.PURGE_AUDIT, Action.CREATE],
    [Resource.PURGE_AUDIT, Action.LIST],
    [Resource.PURGE_AUDIT, Action.UPDATE],
    [Resource.PURGE_AUDIT, Action.STOP],

    [Resource.JOBSERVICE_MONITOR, Action.LIST],
    [Resource.JOBSERVICE_MONITOR, Action.STOP],

    [Resource.SCANNER, Action.READ],
    [Resource.SCANNER, Action.CREATE],
    [Resource.SCANNER, Action.DELETE],
    [Resource.SCANNER, Action.LIST],
    [Resource.SCANNER, Action.UPDATE],

    [Resource.LABEL, Action.READ],
    [Resource.LABEL, Action.CREATE],
    [Resource.LABEL, Action.DELETE],
    [Resource.LABEL, Action.UPDATE],

    [Resource.SECURITY_HUB, Action.READ],
    [Resource.SECURITY_HUB, Action.LIST],

    [Resource.CATALOG, Action.READ],

    [Resource.QUOTA, Action.READ],
    [Resource.QUOTA, Action.LIST],
];

function toAccess(policies: Policy[]) : RobotPermissionAccess[] {
    return policies.map(([resource, action]) => ({ resource, action }));
}

/**
 * Create a project robot permission granting every
 * project-scope policy Harbor lists for robots.
 *
 * The robot, member and export-cve policies Harbor also
 * accepts for project robots are not included.
 *
 * @param namespace (e.g. * or project name)
 */
export function buildRobotPermissionForAllResources(
    namespace: string,
) : RobotPermission {
    return {
        access: toAccess(PROJECT_POLICIES),
        kind: 'project',
        namespace,
    };
}

/**
 * Create a system robot permission granting every
 * system-scope policy Harbor lists for robots.
 *
 * The robot, user, ldap-user, user-group and quota update
 * policies Harbor also accepts for system robots are not included.
 */
export function buildRobotPermissionForAllSystemResources() : RobotPermission {
    return {
        access: toAccess(SYSTEM_POLICIES),
        kind: 'system',
        namespace: '/',
    };
}
