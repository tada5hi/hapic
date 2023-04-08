/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type KeyValueBaseContext = {
    /**
     * The mount point on which the secret
     * engine is mounted.
     */
    mount: string,
    /**
     * The secret path relative to the secret engine
     * mount.
     */
    path: string
};

export type KeyValueV1CreateContext = KeyValueBaseContext & {
    data: Record<string, any>
};

type KeyValueV2Payload = {
    options?: {
        cas?: number
    },
    data: Record<string, any>
};

export type KeyValueV2CreateContext = KeyValueBaseContext & {
    data: KeyValueV2Payload,
    version?: number
};

export type KeyValueV2CreateResponse = {
    data: {
        created_time: string,
        deletion_time: string,
        destroyed: boolean,
        version: number,
    }
};

export type KeyValueV2UpdateContext = KeyValueBaseContext & {
    data: KeyValueV2Payload,
    version?: number
};

export type KeyValueV2SaveContext = KeyValueBaseContext & {
    data: KeyValueV2Payload,
    version?: number
};

export type KeyValueV2GetOneResponse<
    T extends Record<string, any> = Record<string, any>,
> = {
    data: {
        data: T,
        metadata: {
            created_time: string,
            custom_metadata: {
                owner: string,
                mission_critical: string
            },
            deletion_time: string,
            destroyed: boolean,
            version: number
        }
    }
};
