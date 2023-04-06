/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type {
    ConfigInput,
    ConnectionOptions,
} from './type';
import { MountAPI } from './mount';
import { KeyValueAPI } from './key-value';
import { parseConnectionString } from './utils';

export class Client extends BaseClient {
    override readonly '@instanceof' = Symbol.for('VaultClient');

    public readonly mount : MountAPI;

    public readonly keyValue: KeyValueAPI;

    constructor(input?: ConfigInput) {
        super(input);

        input = input || {};

        this.setHeader('X-Vault-Request', 'true');
        this.setHeader('Content-Type', 'application/json');

        let connectionOptions : ConnectionOptions | undefined;

        if (input.connectionString) {
            connectionOptions = parseConnectionString(input.connectionString);
        }

        if (input.connectionOptions) {
            connectionOptions = input.connectionOptions;
        }

        if (connectionOptions) {
            this.setBaseURL(connectionOptions.host);
            this.setHeader('X-Vault-Token', connectionOptions.token);
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
