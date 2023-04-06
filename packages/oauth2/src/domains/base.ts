/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver, isClient } from 'hapic';
import type { Client, Driver } from 'hapic';
import type { Options } from '../type';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected options!: Options;

    protected driver!: Driver;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        this.options = context.options || {};
    }

    // -----------------------------------------------------------------------------------

    setDriver(input: Client | Driver) {
        if (isClient(input)) {
            this.driver = input.driver;
        } else {
            this.driver = createDriver(input);
        }
    }

    setOptions(options: Options) {
        this.options = options;
    }

    setOption<K extends keyof Options>(key: K, value: Options[K]) {
        this.options[key] = value;
    }
}
