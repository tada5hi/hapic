/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConnectionStringParseError } from '../../../src';
import {
    isConnectionStringParseError,
    parseConnectionString,
} from '../../../src';

describe('src/utils/connection-string', () => {
    it('should parse token and host', () => {
        expect(parseConnectionString('mytoken@https://vault.example.com/'))
            .toEqual({
                host: 'https://vault.example.com/',
                token: 'mytoken',
            });
    });

    it('should throw when the host separator is missing', () => {
        let error: unknown;
        try {
            parseConnectionString('mytoken');
        } catch (e) {
            error = e;
        }

        expect(isConnectionStringParseError(error)).toBe(true);
        expect((error as ConnectionStringParseError).message)
            .toContain('token@host');
    });
});
