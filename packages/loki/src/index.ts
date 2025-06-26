/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from './instance';

export * from './config';
export * from './constants';
export * from './client';
export * from './domains';
export * from './instance';
export * from './module';
export * from './utils';

const client = createClient();
export default client;
