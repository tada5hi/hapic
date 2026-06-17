/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { TokenAPI } from '../../../../src';

describe('src/domains/token', () => {
    it('should revoke token', async () => {
        const transport = new MemoryTransport();
        const tokenAPI = new TokenAPI({ client: createClient({ transport }) });

        const response = await tokenAPI.revoke({ token: 'foo' });
        expect(response).toBeDefined();

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('POST');
        expect(request.url).toBe('/token/revoke');
        expect(new URLSearchParams(request.init.body as any).get('token')).toBe('foo');
    });
});
