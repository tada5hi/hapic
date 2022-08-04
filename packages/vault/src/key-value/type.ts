/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from 'hapic';
import { MountAPI } from '../mount';

export type KeyValueContext = {
    client: ClientDriverInstance,
    mountAPI: MountAPI
};
