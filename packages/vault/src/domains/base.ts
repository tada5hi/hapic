/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient, isClient } from 'hapic';
import type {
    Client, RequestOptions,
} from 'hapic';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected client!: Client;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        this.setDriver(context.client);
    }

    // -----------------------------------------------------------------------------------

    setDriver(input?: Client | RequestOptions) {
        if (isClient(input)) {
            this.client = input;
        } else {
            this.client = createClient(input);
        }
    }
}
