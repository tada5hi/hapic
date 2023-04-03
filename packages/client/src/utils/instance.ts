/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios, { Axios } from 'axios';
import type { ClientDriverInstance, ClientRequestConfig } from '../type';
import { isObject } from './object';

export function isClientDriverInstance(input: unknown) : input is Axios {
    if (input instanceof Axios) {
        return true;
    }

    if (!isObject(input) && typeof input !== 'function') {
        return false;
    }

    return typeof (input as Axios).get !== 'undefined' &&
        typeof (input as Axios).defaults !== 'undefined';
}

export function createClientDriverInstance(
    input?: ClientDriverInstance | ClientRequestConfig,
) : ClientDriverInstance {
    return isClientDriverInstance(input) ?
        input :
        axios.create(input);
}
