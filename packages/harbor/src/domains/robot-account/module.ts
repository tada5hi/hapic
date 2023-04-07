/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Driver } from 'hapic';
import { merge } from 'smob';
import type {
    RobotAccount, RobotAccountCreateOptions,
    RobotAccountFindOneOptions,
    RobotAccountPermission,
    RobotAccountUpdateOptions,
    RobotAccountWithSecret,
} from './type';
import { buildRobotAccountPermissionForNamespace } from './utils';

export class RobotAccountAPI {
    protected client: Driver;

    constructor(client: Driver) {
        this.client = client;
    }

    async create(
        data: RobotAccount,
        options?: RobotAccountCreateOptions,
    ) : Promise<RobotAccount> {
        const response = await this.client
            .post('robots', this.extendPayload(data, options));

        return response.data;
    }

    async delete(id: RobotAccount['id']): Promise<void> {
        await this.client
            .delete(`robots/${id}`);
    }

    async findOne(options: RobotAccountFindOneOptions): Promise<RobotAccount | undefined> {
        const { data } = await this.client.get(`robots?q=name%3D${options.name}&page_size=1`);

        if (!Array.isArray(data) || data.length === 0) {
            return undefined;
        }

        const account : RobotAccount = data.shift();

        let lookupName : string;
        if (!options.name.startsWith('robot$')) {
            lookupName = `robot$${options.name}`;
        } else {
            lookupName = options.name;
        }
        if (account.name !== lookupName || account.name === options.name) {
            return undefined;
        }

        const withSecret = typeof options.withSecret === 'boolean' ?
            options.withSecret :
            true;

        if (withSecret && account.id) {
            const patchedAccount = await this.updateSecret(account.id);
            account.secret = patchedAccount.secret as string | undefined;
        }

        return account;
    }

    /**
     * Update harbor project robot account.
     * If no "secret" provided, a new secret is generated.
     *
     * @param id
     * @param secret
     */
    async updateSecret(
        id: string | number,
        secret?: string,
    ): Promise<RobotAccountWithSecret> {
        const payload: Record<string, any> = {
            ...(secret ? { secret } : {}),
        };

        const { data }: { data: RobotAccount } = await this.client
            .patch(`robots/${id}`, payload);

        if (typeof payload.secret !== 'undefined') {
            data.secret = payload.secret;
        }

        return data as RobotAccountWithSecret;
    }

    async update(
        id: string | number,
        data?: Partial<RobotAccount>,
        options?: RobotAccountUpdateOptions,
    ): Promise<Partial<RobotAccount>> {
        data = data || {};
        data = this.extendPayload({ ...data, id }, options);

        await this.client
            .put(`robots/${id}`, data);

        return data;
    }

    protected extendPayload<T extends Record<string, any>>(
        data: T,
        options?: {projectName?: string},
    ) : T {
        options = options || {};
        let permissions : RobotAccountPermission[] = [];
        if (options.projectName) {
            permissions = [
                buildRobotAccountPermissionForNamespace(
                    options.projectName,
                ),
            ];
        }
        return merge((data || {}), {
            description: '',
            duration: -1,
            level: 'system',
            editable: true,
            disable: false,
            permissions,
        } satisfies Partial<RobotAccount>) as T;
    }
}
