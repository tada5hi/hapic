/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Built-in secrets engine types.
 * Plugin types are accepted as plain strings (see MountTypeInput).
 */
export enum MountType {
    ALICLOUD = 'alicloud',
    AWS = 'aws',
    AZURE = 'azure',
    CONSUL = 'consul',
    CUBBYHOLE = 'cubbyhole',
    DATABASE = 'database',
    GCP = 'gcp',
    GCP_KMS = 'gcpkms',
    IDENTITY = 'identity',
    KEY_MANAGEMENT = 'keymgmt',
    KEY_VALUE = 'kv',
    KMIP = 'kmip',
    KUBERNETES = 'kubernetes',
    LDAP = 'ldap',
    MONGODB_ATLAS = 'mongodbatlas',
    NOMAD = 'nomad',
    PKI = 'pki',
    RABBITMQ = 'rabbitmq',
    SSH = 'ssh',
    SYSTEM = 'system',
    TERRAFORM = 'terraform',
    TOTP = 'totp',
    TRANSFORM = 'transform',
    TRANSIT = 'transit',
}

/**
 * Value of options.version of a kv mount.
 * Vault stores and returns it as a string.
 */
export enum KeyValueVersion {
    ONE = '1',
    TWO = '2',
}
