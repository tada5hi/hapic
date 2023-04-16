/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createDefaultRequestTransformer } from './transformer';
import type { RequestOptions } from './type';

export function extendRequestOptionsWithDefaults(options: RequestOptions) : RequestOptions {
    if (!options.transform) {
        options.transform = [
            createDefaultRequestTransformer,
        ];
    }

    return options;
}
