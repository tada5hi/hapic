/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Resources a robot permission can grant access to
 * (src/common/rbac/const.go, Harbor v2.16.0).
 * Project-scope and system-scope resources share one list.
 */
export enum RobotPermissionResource {
    ACCESSORY = 'accessory',
    ARTIFACT = 'artifact',
    ARTIFACT_ADDITION = 'artifact-addition',
    ARTIFACT_LABEL = 'artifact-label',
    AUDIT_LOG = 'audit-log',
    CATALOG = 'catalog',
    EXPORT_CVE = 'export-cve',
    GARBAGE_COLLECTION = 'garbage-collection',
    IMMUTABLE_TAG = 'immutable-tag',
    JOBSERVICE_MONITOR = 'jobservice-monitor',
    LABEL = 'label',
    LDAP_USER = 'ldap-user',
    LOG = 'log',
    MEMBER = 'member',
    METADATA = 'metadata',
    NOTIFICATION_POLICY = 'notification-policy',
    PREHEAT_INSTANCE = 'preheat-instance',
    PREHEAT_POLICY = 'preheat-policy',
    PROJECT = 'project',
    PURGE_AUDIT = 'purge-audit',
    QUOTA = 'quota',
    REGISTRY = 'registry',
    REPLICATION = 'replication',
    REPLICATION_ADAPTER = 'replication-adapter',
    REPLICATION_POLICY = 'replication-policy',
    REPOSITORY = 'repository',
    ROBOT = 'robot',
    SBOM = 'sbom',
    SCAN = 'scan',
    SCAN_ALL = 'scan-all',
    SCANNER = 'scanner',
    SECURITY_HUB = 'security-hub',
    SYSTEM_VOLUMES = 'system-volumes',
    TAG = 'tag',
    TAG_RETENTION = 'tag-retention',
    USER = 'user',
    USER_GROUP = 'user-group',
}

/**
 * Actions of a robot permission access entry
 * (src/common/rbac/const.go, Harbor v2.16.0).
 */
export enum RobotPermissionAction {
    ALL = '*',
    CREATE = 'create',
    DELETE = 'delete',
    READ = 'read',
    UPDATE = 'update',
    PULL = 'pull',
    PUSH = 'push',
    LIST = 'list',
    OPERATE = 'operate',
    SCANNER_PULL = 'scanner-pull',
    STOP = 'stop',
}
