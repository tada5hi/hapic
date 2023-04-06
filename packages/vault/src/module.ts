/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConfigInput } from 'hapic';
import { Client as BaseClient, buildConfig } from 'hapic';
import { merge } from 'smob';
import type {
    ConnectionConfig,
} from './type';
import { MountAPI } from './mount';
import { KeyValueAPI } from './key-value';
import { parseConnectionString } from './utils';

export class Client extends BaseClient {
    override readonly '@instanceof' = Symbol.for('VaultClient');

    public readonly mount : MountAPI;

    public readonly keyValue: KeyValueAPI;

    constructor(input?: ConfigInput) {
        let vaultConfig : ConnectionConfig | undefined;

        const config = buildConfig(input);

        if (
            config.extra &&
            config.extra.connectionString
        ) {
            vaultConfig = parseConnectionString(config.extra.connectionString);
        }

        config.driver = merge({
            withCredentials: true,
            timeout: 3000,
            ...(vaultConfig ? { baseURL: vaultConfig.host } : {}),
            headers: {
                'X-Vault-Request': 'true',
                'Content-Type': 'application/json',
            },
        }, (config.driver || {}));

        super(config);

        if (vaultConfig) {
            this.setHeader('X-Vault-Token', vaultConfig.token);
        }

        this.mount = new MountAPI(this.driver);
        this.keyValue = new KeyValueAPI({
            client: this.driver,
            mountAPI: this.mount,
        });
    }

    setNamespace(namespace: string) {
        this.setHeader('X-Vault-Namespace', namespace);
    }

    unsetNamespace() {
        this.unsetHeader('X-Vault-Namespace');
    }
}
