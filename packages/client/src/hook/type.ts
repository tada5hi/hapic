/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientError } from '../error';
import type { RequestOptions } from '../request';
import type { Response } from '../response';

export type HookErrorFn = (input: ClientError) => Promise<RequestOptions | Response> | RequestOptions | Response;
export type HookReqFn = (input: RequestOptions) => Promise<RequestOptions> | RequestOptions;
export type HookResFn = (input: Response) => Promise<Response> | Response;
export type HookFn = HookReqFn | HookResFn | HookErrorFn;
