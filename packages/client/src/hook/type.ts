/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientError } from '../error';
import type { RequestOptions } from '../request';
import type { Response } from '../response';
import type { HookName } from './constants';

export type HookOptions = {
    returnOnResponse?: boolean,
    continueOnError?: boolean
};

export type HookInputMap<
    T extends `${HookName}`,
> = T extends `${HookName.RESPONSE}` ?
    Response :
    T extends `${HookName.REQUEST}` ?
        RequestOptions :
        ClientError;

export type HookOutputMap<
T extends `${HookName}`,
> = T extends `${HookName.RESPONSE}` ?
    Response :
    T extends `${HookName.REQUEST}` ?
        RequestOptions :
        RequestOptions | Response;

export type HookErrorFn = (input: ClientError) => Promise<RequestOptions | Response> | RequestOptions | Response;
export type HookReqFn = (input: RequestOptions) => Promise<RequestOptions> | RequestOptions;
export type HookResFn = (input: Response) => Promise<Response> | Response;

export type HookFn<
H extends `${HookName}` = `${HookName}`,
> = H extends `${HookName.REQUEST}` ?
    HookReqFn :
    H extends `${HookName.RESPONSE}` ?
        HookResFn :
        HookErrorFn;
