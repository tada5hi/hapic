/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RobotPermissionAction, RobotPermissionResource } from './constants';
import type { RobotPermission } from './type';

/**
 * Create robot permission to access all resources.
 *
 * @param namespace (e.g. * or project name)
 */
export function buildRobotPermissionForAllResources(
    namespace: string,
) : RobotPermission {
    return {
        access: [
            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.ARTIFACT, action: RobotPermissionAction.READ },

            { resource: RobotPermissionResource.ARTIFACT_LABEL, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.ARTIFACT_LABEL, action: RobotPermissionAction.DELETE },

            { resource: RobotPermissionResource.IMMUTABLE_TAG, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.IMMUTABLE_TAG, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.IMMUTABLE_TAG, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.IMMUTABLE_TAG, action: RobotPermissionAction.UPDATE },

            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.PULL },
            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.PUSH },
            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.UPDATE },
            { resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.DELETE },

            { resource: RobotPermissionResource.TAG, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.TAG, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.TAG, action: RobotPermissionAction.LIST },

            { resource: RobotPermissionResource.SCAN, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.SCAN, action: RobotPermissionAction.STOP },
            { resource: RobotPermissionResource.SCAN, action: RobotPermissionAction.CREATE },

            { resource: RobotPermissionResource.LABEL, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.LABEL, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.LABEL, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.LABEL, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.LABEL, action: RobotPermissionAction.UPDATE },

            { resource: RobotPermissionResource.METADATA, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.METADATA, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.METADATA, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.METADATA, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.METADATA, action: RobotPermissionAction.UPDATE },

            { resource: RobotPermissionResource.LOG, action: RobotPermissionAction.LIST },

            { resource: RobotPermissionResource.NOTIFICATION_POLICY, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.NOTIFICATION_POLICY, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.NOTIFICATION_POLICY, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.NOTIFICATION_POLICY, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.NOTIFICATION_POLICY, action: RobotPermissionAction.UPDATE },

            { resource: RobotPermissionResource.PREHEAT_POLICY, action: RobotPermissionAction.CREATE },
            { resource: RobotPermissionResource.PREHEAT_POLICY, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.PREHEAT_POLICY, action: RobotPermissionAction.LIST },
            { resource: RobotPermissionResource.PREHEAT_POLICY, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.PREHEAT_POLICY, action: RobotPermissionAction.UPDATE },

            { resource: RobotPermissionResource.PROJECT, action: RobotPermissionAction.DELETE },
            { resource: RobotPermissionResource.PROJECT, action: RobotPermissionAction.READ },
            { resource: RobotPermissionResource.PROJECT, action: RobotPermissionAction.UPDATE },
        ],
        kind: 'project',
        namespace,
    };
}
