/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ConnectionStringParseError,
    isConnectionStringParseError,
    parseConnectionString,
} from '../../../src';

describe('src/utils/connection-string', () => {
    it('should parse user, password and host', () => {
        expect(parseConnectionString('admin:start123@https://example.com/api/v2.0/'))
            .toEqual({
                host: 'https://example.com/api/v2.0/',
                user: 'admin',
                password: 'start123',
            });
    });

    it('should throw when the host separator is missing', () => {
        let error: unknown;
        try {
            parseConnectionString('admin:start123');
        } catch (e) {
            error = e;
        }

        expect(isConnectionStringParseError(error)).toBe(true);
        expect((error as ConnectionStringParseError).message)
            .toContain('user:password@host');
    });

    it('should throw when the credentials lack a password', () => {
        expect(() => parseConnectionString('admin@https://example.com/'))
            .toThrow(ConnectionStringParseError);
    });
});
