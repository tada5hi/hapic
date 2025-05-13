/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDefaultRequestTransformer } from './transformer';
import type { RequestBaseOptions } from './type';

export function extendRequestOptionsWithDefaults(options: RequestBaseOptions) : RequestBaseOptions {
    if (!options.transform) {
        options.transform = [
            createDefaultRequestTransformer(),
        ];
    }

    if (typeof options.proxy === 'undefined') {
        options.proxy = true;
    }

    return options;
}
