/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenGrantParameters, TokenTokenExchangeParameters } from '../../../../src';
import { TokenAPI } from '../../../../src';

describe('src/domains/token (token exchange types)', () => {
    it('should require actor_token_type with actor_token', () => {
        // @ts-expect-error actor_token_type is missing
        const parameters : TokenTokenExchangeParameters = {
            subject_token: 'subject',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: 'actor',
        };

        expectTypeOf(parameters).not.toBeAny();
    });

    it('should require the subject token', () => {
        const api = new TokenAPI();

        // @ts-expect-error subject_token_type is missing
        expectTypeOf(api.createWithTokenExchange).toBeCallableWith({ subject_token: 'subject' });
    });

    it('should keep the other grants strict', () => {
        const parameters : TokenGrantParameters = {
            grant_type: 'password',
            username: 'admin',
            password: 'start123',
            // @ts-expect-error unknown parameter of the password grant
            cap: 'foo',
        };

        expectTypeOf(parameters).not.toBeAny();
    });
});
