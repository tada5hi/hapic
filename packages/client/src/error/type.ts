/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../request';
import type { Response } from '../response';
import type { ErrorCode } from './constants';

export type ClientErrorCreateContext<T = any> = {
    request: RequestOptions,
    error?: Error,
    response?: Response<T>,
    code?: ErrorCode,
};

export type ClientErrorContext<T = any> = ClientErrorCreateContext<T> & {
    message: string
};
