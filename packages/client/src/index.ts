/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from './instance';

export * from './hook';
export * from './request';
export * from './response';
export * from './constants';
export * from './error';
export * from './header';
export * from './module';
export * from './instance';
export * from './fetch';
export * from './utils';

const client = createClient();
export default client;
