/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient, isClient } from 'hapic';
import type { Client, RequestBaseOptions } from 'hapic';
import type { Options } from '../config';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected client! : Client;

    protected options!: Options;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        this.setClient(context.client);
        this.setOptions(context.options);
    }

    // -----------------------------------------------------------------------------------

    setClient(input?: Client | RequestBaseOptions) {
        this.client = isClient(input) ?
            input :
            createClient(input);
    }

    setOptions(options?: Options) {
        this.options = options || {};
    }

    setOption<K extends keyof Options>(key: K, value: Options[K]) {
        this.options[key] = value;
    }
}
