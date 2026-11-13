/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BaseAPI as SharedBaseAPI } from 'hapic';
import type { IClient, RequestBaseOptions } from 'hapic';

export abstract class BaseAPI extends SharedBaseAPI {
    /**
     * @deprecated Use `setClient` instead.
     *
     * @param input
     */
    setDriver(input?: IClient | RequestBaseOptions) {
        this.setClient(input);
    }
}
