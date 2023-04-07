/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client as BaseClient } from 'hapic';
import type { ConfigInput, ConnectionOptions } from './config';
import { HeaderName } from './constants';
import { KeyValueV1API, KeyValueV2API, MountAPI } from './domains';
import { parseConnectionString } from './utils';

export class Client extends BaseClient {
    override readonly '@instanceof' = Symbol.for('VaultClient');

    public readonly mount : MountAPI;

    public readonly keyValueV1: KeyValueV1API;

    public readonly keyValueV2: KeyValueV2API;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        super(input);

        this.mount = new MountAPI({ driver: this.driver });
        this.keyValueV1 = new KeyValueV1API({ driver: this.driver });
        this.keyValueV2 = new KeyValueV2API({ driver: this.driver });

        this.setConfig(input);
    }

    // -----------------------------------------------------------------------------------

    override setConfig(input?: ConfigInput) {
        super.setConfig(input);

        input = input || {};

        this.setHeader(HeaderName.VAULT_REQUEST, 'true');
        this.setHeader(HeaderName.CONTENT_TYPE, 'application/json');

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

        if (this.keyValueV1) {
            this.keyValueV1.setDriver(this.driver);
        }

        if (this.keyValueV2) {
            this.keyValueV2.setDriver(this.driver);
        }

        return this;
    }

    // -----------------------------------------------------------------------------------

    setNamespace(namespace: string) {
        this.setHeader(HeaderName.VAULT_NAMESPACE, namespace);
    }

    unsetNamespace() {
        this.unsetHeader(HeaderName.VAULT_NAMESPACE);
    }
}
