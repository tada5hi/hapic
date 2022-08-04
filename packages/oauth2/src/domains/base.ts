/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, ClientDriverInstance } from 'hapic';
import { ClientOptions } from '../type';
import { hasOwnProperty } from '../utils';

export abstract class BaseOAuth2API {
    protected options : ClientOptions;

    protected client : Client | ClientDriverInstance;

    // -----------------------------------------------------------------------------------

    protected constructor(client: Client | ClientDriverInstance, options?: ClientOptions) {
        this.client = client;

        if (options) {
            this.options = options;
        } else if (hasOwnProperty(client, 'options')) {
            this.options = client.options as ClientOptions;
        }
    }

    // -----------------------------------------------------------------------------------

    setClient(client: Client | ClientDriverInstance) {
        this.client = client;
    }

    setOptions(options: ClientOptions) {
        this.options = options;
    }
}
