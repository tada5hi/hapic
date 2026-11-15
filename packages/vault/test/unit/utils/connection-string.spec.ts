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

    it('should read the namespace from the host query', () => {
        expect(parseConnectionString('tok@https://vault:8200/v1/?namespace=team-a'))
            .toEqual({
                host: 'https://vault:8200/v1/',
                token: 'tok',
                namespace: 'team-a',
            });
    });

    it('should decode a nested namespace', () => {
        expect(parseConnectionString('tok@https://vault:8200/v1/?namespace=team-a%2Fsub'))
            .toEqual({
                host: 'https://vault:8200/v1/',
                token: 'tok',
                namespace: 'team-a/sub',
            });

        expect(parseConnectionString('tok@https://vault:8200/v1/?namespace=team-a/sub'))
            .toEqual({
                host: 'https://vault:8200/v1/',
                token: 'tok',
                namespace: 'team-a/sub',
            });
    });

    it('should only remove the namespace parameter from the host', () => {
        expect(parseConnectionString('tok@https://h/v1/?foo=1&namespace=x'))
            .toEqual({
                host: 'https://h/v1/?foo=1',
                token: 'tok',
                namespace: 'x',
            });

        expect(parseConnectionString('tok@https://h/v1/?foo=1'))
            .toEqual({
                host: 'https://h/v1/?foo=1',
                token: 'tok',
            });
    });

    it('should throw a parse error for a malformed namespace', () => {
        let error: unknown;

        try {
            parseConnectionString('tok@https://h/v1/?namespace=%E0%A4%A');
        } catch (e) {
            error = e;
        }

        expect(isConnectionStringParseError(error)).toBe(true);
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
