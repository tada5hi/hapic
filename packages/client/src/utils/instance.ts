/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import axios, { Axios } from 'axios';
import type { Driver, DriverRequestConfig } from '../type';
import { isObject } from './object';

export function isDriver(input: unknown) : input is Driver {
    if (input instanceof Axios) {
        return true;
    }

    if (!isObject(input) && typeof input !== 'function') {
        return false;
    }

    return typeof (input as Axios).get !== 'undefined' &&
        typeof (input as Axios).defaults !== 'undefined';
}

export function createDriver(
    input?: Driver | DriverRequestConfig,
) : Driver {
    return isDriver(input) ?
        input :
        axios.create(input);
}

export function verifyInstanceBySymbol(
    input: unknown,
    name: string,
) {
    if (!isObject(input) && typeof input !== 'function') {
        return false;
    }

    return (input as { '@instanceof': symbol })['@instanceof'] ===
        Symbol.for(name);
}
