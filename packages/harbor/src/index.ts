/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from './instance';

export * from './constants';
export * from './client';
export * from './config';
export * from './instance';
export * from './domains';
export * from './module';
export * from './type';
export * from './utils';

const client = createClient();
export default client;
