/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RobotPermissionResource {
    ARTIFACT = 'artifact',
    ARTIFACT_LABEL = 'artifact-label',
    IMMUTABLE_TAG = 'immutable-tag',
    LABEL = 'label',
    LOG = 'log',
    METADATA = 'metadata',
    NOTIFICATION_POLICY = 'notification-policy',
    PREHEAT_POLICY = 'preheat-policy',
    PROJECT = 'project',
    REPOSITORY = 'repository',
    SCAN = 'scan',
    TAG = 'tag',
}

export enum RobotPermissionAction {
    CREATE = 'create',
    DELETE = 'delete',
    READ = 'read',
    UPDATE = 'update',
    PULL = 'pull',
    PUSH = 'push',
    LIST = 'list',
    STOP = 'stop',
}
