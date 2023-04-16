/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from 'hapic';
import type { ConfigInput, ConnectionOptions } from './config';
import { HeaderName } from './constants';
import { KeyValueV1API, KeyValueV2API, MountAPI } from './domains';
import { parseConnectionString } from './utils';

export class VaultClient extends Client {
    override readonly '@instanceof' = Symbol.for('VaultClient');

    public readonly mount : MountAPI;

    public readonly keyValueV1: KeyValueV1API;

    public readonly keyValueV2: KeyValueV2API;

    // -----------------------------------------------------------------------------------

    constructor(input?: ConfigInput) {
        input = input || {};

        super(input.request);

        this.mount = new MountAPI({ client: this });
        this.keyValueV1 = new KeyValueV1API({ client: this });
        this.keyValueV2 = new KeyValueV2API({ client: this });

        this.applyConfig(input);
    }

    // -----------------------------------------------------------------------------------

    applyConfig(input?: ConfigInput) {
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
