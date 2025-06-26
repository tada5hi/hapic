/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, RequestBaseOptions } from 'hapic';
import type { Options } from '../config';

export type BaseAPIContext = {
    client?: Client | RequestBaseOptions,
    options?: Options
};
