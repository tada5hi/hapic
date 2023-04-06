/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, createClientDriverInstance } from 'hapic';
import type { ClientDriverInstance } from 'hapic';
import type { Options } from '../type';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected options : Options;

    protected driver : Client | ClientDriverInstance;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        if (context.driver instanceof Client) {
            this.driver = context.driver;
        } else {
            this.driver = createClientDriverInstance(context.driver);
        }

        this.options = context.options || {};
    }

    // -----------------------------------------------------------------------------------

    setDriver(client: Client | ClientDriverInstance) {
        this.driver = client;
    }
}
