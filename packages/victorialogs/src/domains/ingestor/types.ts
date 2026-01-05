/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type IngestorData<
    T extends Record<string, any> = Record<string, any>,
> = {
    _msg: string,
    _time?: string,
    _stream?: string,
} & T;
