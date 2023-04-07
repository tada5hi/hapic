/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDriver, isClient } from 'hapic';
import type { Client, Driver, DriverRequestConfig } from 'hapic';
import type { BaseAPIContext } from './type';

export abstract class BaseAPI {
    protected driver!: Driver;

    // -----------------------------------------------------------------------------------

    protected constructor(context?: BaseAPIContext) {
        context = context || {};

        this.setDriver(context.driver);
    }

    // -----------------------------------------------------------------------------------

    setDriver(input?: Client | Driver | DriverRequestConfig) {
        if (isClient(input)) {
            this.driver = input.driver;
        } else {
            this.driver = createDriver(input);
        }
    }
}
