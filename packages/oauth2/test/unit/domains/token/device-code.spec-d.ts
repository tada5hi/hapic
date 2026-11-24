/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DeviceAuthorizationResponse, TokenGrantResponse } from '../../../../src';
import { TokenAPI } from '../../../../src';

describe('src/domains/token (device code types)', () => {
    it('should take a device authorization response with extension parameters', () => {
        const api = new TokenAPI();
        const authorization = {} as DeviceAuthorizationResponse;

        const poll = () => api.pollWithDeviceCode({ ...authorization, realm_name: 'master' });
        const create = () => api.createWithDeviceCode({ device_code: 'device', realm_name: 'master' });

        expectTypeOf(poll).returns.resolves.toEqualTypeOf<TokenGrantResponse>();
        expectTypeOf(create).returns.resolves.toEqualTypeOf<TokenGrantResponse>();
    });

    it('should require the device code', () => {
        const api = new TokenAPI();

        // @ts-expect-error device_code is missing
        const poll = () => api.pollWithDeviceCode({ realm_name: 'master' });

        expectTypeOf(poll).toBeFunction();
    });
});
