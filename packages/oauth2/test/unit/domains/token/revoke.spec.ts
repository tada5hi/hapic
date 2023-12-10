/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import {
    createClient,
} from 'hapic';
import { TokenAPI } from '../../../../src';

const driver = createClient();
const postFn = jest.fn();

postFn.mockImplementation((
    _url: string,
    _data?: any,
    config?: RequestBaseOptions,
) => Promise.resolve({ data: undefined, request: { config } }));

driver.post = postFn;

describe('src/domains/token', () => {
    it('should introspect token', async () => {
        const tokenAPI = new TokenAPI({ client: driver });

        const response = await tokenAPI.revoke({ token: 'foo' });
        expect(response).toBeDefined();
    });
});
