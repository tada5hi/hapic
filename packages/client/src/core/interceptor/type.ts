/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientContext, ClientContextWithError } from '../context';

export type InterceptorHandler = (ctx: ClientContext) => Promise<ClientContext> | any;
export type InterceptorErrorHandler = (ctx: ClientContextWithError) => Promise<ClientContext |
ClientContextWithError> | any;
