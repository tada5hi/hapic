/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import { isRequestError } from 'hapic';
import { buildKeyValueURLPath } from './utils';
import type {
    KeyValueContext,
} from './type';
import type {
    MountAPI,
    MountKeyValueOptions,
    MountKeyValuePayload,
} from '../mount';
import {
    MountKeyValueVersion,
} from '../mount';
import type { ResourceResponse } from '../../type';

export class KeyValueAPI {
    protected client: Driver;

    protected mount: MountAPI;

    constructor(context: KeyValueContext) {
        this.client = context.client;
        this.mount = context.mountAPI;
    }

    async save(engine: string, key: string, value: Record<string, any>, options?: MountKeyValueOptions) : Promise<any> {
        options = options || {};
        options.version = options.version || MountKeyValueVersion.ONE;

        try {
            const response = await this.client.post(buildKeyValueURLPath(options.version, engine, key), value);
            return response.data;
        } catch (e) {
            if (
                isRequestError(e) &&
                e.response &&
                e.response.status === 404
            ) {
                await this.createMount({ path: engine });

                return this.save(engine, key, value, options);
            }

            throw e;
        }
    }

    async find<T extends Record<string, any> = Record<string, any>>(
        engine: string,
        key: string,
        options?: MountKeyValueOptions,
    ) : Promise<ResourceResponse<T> | undefined> {
        options = options || {};
        options.version = options.version || MountKeyValueVersion.ONE;

        try {
            const { data } = await this.client.get(buildKeyValueURLPath(options.version, engine, key));

            return data;
        } catch (e) {
            if (
                isRequestError(e) &&
                e.response &&
                e.response.status === 404
            ) {
                return undefined;
            }

            throw e;
        }
    }

    async delete(
        engine: string,
        key: string,
        options?: MountKeyValueOptions,
    ) {
        options = options || {};
        options.version = options.version || MountKeyValueVersion.ONE;

        try {
            await this.client.delete(buildKeyValueURLPath(options.version, engine, key));
        } catch (e) {
            if (
                isRequestError(e) &&
                e.response &&
                e.response.status === 404
            ) {
                return;
            }

            throw e;
        }
    }

    async createMount(
        config: Pick<MountKeyValuePayload, 'path'> & Partial<MountKeyValuePayload>,
        options?: MountKeyValueOptions,
    ) {
        return this.mount.create({
            config: {},
            generate_signing_key: true,
            options: options || {},
            type: 'kv',
            ...config,
        });
    }
}
