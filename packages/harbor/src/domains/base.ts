/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient, isClient } from 'hapic';
import type { IClient, RequestBaseOptions } from 'hapic';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected client!: IClient;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        this.setClient(context.client);
    }

    // -----------------------------------------------------------------------------------

    setClient(input?: IClient | RequestBaseOptions) {
        if (isClient(input)) {
            this.client = input;
        } else {
            this.client = createClient(input);
        }
    }
}
