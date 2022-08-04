/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MountKeyValueVersion } from '../mount';

export function buildKeyValueURLPath(version: MountKeyValueVersion, engine: string, key: string) : string {
    switch (version) {
        case MountKeyValueVersion.ONE:
            return `${engine}/${key}`;
        case MountKeyValueVersion.TWO:
            return `${engine}/data/${key}`;
        default:
            return '';
    }
}
