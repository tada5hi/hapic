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

/**
 * The outcome of running the error hooks for a failed request.
 *
 * An error hook recovers by returning either a {@link Response} (the failure is
 * swallowed and that response becomes the result) or {@link RequestOptions}
 * (the request is retried). {@link HookManager.triggerErrorHook} classifies the
 * returned value into this discriminated result; when no hook recovers it
 * throws instead of returning.
 */
export type HookErrorRecovery = { type: 'response', response: Response } |
    { type: 'retry', options: RequestOptions };
