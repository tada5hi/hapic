/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DistributorPushStream = {
    stream?: Record<string, string>,
    values: [string, string] | [string, string, Record<string, string>]
};
