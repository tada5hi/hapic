/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from 'hapic';
import { RobotAccount } from './type';
import { buildRobotAccountPermissionForNamespace } from './utils';
import { mergeDeep } from '../utils';

export class RobotAccountAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async find(
        name: string,
        withSecret = true,
    ): Promise<RobotAccount | undefined> {
        const { data } = await this.client.get(`robots?q=name%3D${name}&page_size=1`);

        const accounts = Array.isArray(data) ? data.filter((account) => account.name === `robot$${name}`) : [];

        if (
            accounts.length === 1
        ) {
            let secret: string | undefined;

            if (withSecret) {
                const patchedAccount = await this.refreshSecret(accounts[0].id);
                secret = patchedAccount.secret;
            }

            return {
                id: accounts[0].id,
                name: accounts[0].name,
                creation_time: accounts[0].creation_time,
                expires_at: accounts[0].expires_at,
                secret,
            };
        }

        return undefined;
    }

    /**
     * Update harbor project robot account.
     * If no "record.secret" provided, a new secret is generated.
     *
     * @param robotId
     * @param secret
     */
    async refreshSecret(
        robotId: string | number,
        secret?: string,
    ): Promise<Pick<RobotAccount, 'secret'>> {
        const payload: Record<string, any> = {
            ...(secret ? { secret } : {}),
        };

        const { data }: { data: RobotAccount } = await this.client
            .patch(`robots/${robotId}`, payload);

        if (typeof payload.secret !== 'undefined') {
            data.secret = payload.secret;
        }

        return data as Pick<RobotAccount, 'secret'>;
    }

    async update(
        id: string | number,
        namespace: string,
        data?: Partial<RobotAccount>,
    ): Promise<Partial<RobotAccount>> {
        data = mergeDeep({
            id,
            description: '',
            duration: -1,
            level: 'system',
            editable: true,
            disable: false,
            permissions: [buildRobotAccountPermissionForNamespace(namespace)],
        }, (data || {}));

        await this.client
            .put(`robots/${id}`, data);

        return data;
    }

    async create(
        robotName: string,
        projectName?: string,
        payload?: Partial<RobotAccount>,
    ) {
        payload = mergeDeep({
            name: robotName,
            duration: -1,
            level: 'system',
            disable: false,
            permissions: [buildRobotAccountPermissionForNamespace(projectName ?? robotName)],
        }, (payload || {}));

        const { data }: { data: RobotAccount } = await this.client
            .post('robots', payload);

        return data;
    }

    async delete(id: RobotAccount['id']): Promise<void> {
        await this.client
            .delete(`robots/${id}`);
    }
}
