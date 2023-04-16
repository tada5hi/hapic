/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ResponseType } from '../../constants';
import type { ClientError } from '../../error';
import type { RequestOptions } from '../request';
import type { Response, ResponseData } from '../response';

export type ClientContext<RT extends `${ResponseType}` = `${ResponseType.JSON}`, T = any> = {
    request: string,
    options: RequestOptions<RT>,
    response?: Response<ResponseData<RT, T>>,
    error?: ClientError<T>
};

export type ClientContextWithError<
    RT extends `${ResponseType}` = `${ResponseType.JSON}`,
    T = any,
> = ClientContext<RT, T> & {
    error: ClientError
};
