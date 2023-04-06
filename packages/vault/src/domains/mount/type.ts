/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MountType } from './constants';

export enum MountKeyValueVersion {
    ONE = 1,
    TWO = 2,
}

export type MountKeyValueOptions = {
    version?: MountKeyValueVersion
};

export type MountKeyValuePayload = {
    path: string,
    type: `${MountType.KEY_VALUE}`,
    description?: string,
    config: Record<string, any>,
    generate_signing_key?: boolean,
    options: MountKeyValueOptions,
};

export type MountSSHPayload = {
    path: string,
    type: `${MountType.SSH}`,
    description?: string,
    config: Record<string, any>,
    generate_signing_key?: boolean,
};

export type MountPayload = MountKeyValuePayload | MountSSHPayload;
