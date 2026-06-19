/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ConnectionStringParseError,
    isConnectionStringParseError,
    isHapicError,
    resolveConnectionOptions,
    splitConnectionString,
} from '../../../src';

describe('src/connection', () => {
    describe('splitConnectionString', () => {
        it('should split credentials and host', () => {
            expect(splitConnectionString('user:password@https://api.example.com/'))
                .toEqual({
                    credentials: 'user:password',
                    host: 'https://api.example.com/',
                });
        });

        it('should not split a host that contains a scheme separator', () => {
            // only the single `@` separates credentials from host; the host keeps
            // its `://` and any path intact.
            const { credentials, host } = splitConnectionString('token@https://vault.example.com/v1/');

            expect(credentials).toBe('token');
            expect(host).toBe('https://vault.example.com/v1/');
        });

        it('should allow an empty credentials or host segment', () => {
            expect(splitConnectionString('@host')).toEqual({ credentials: '', host: 'host' });
            expect(splitConnectionString('creds@')).toEqual({ credentials: 'creds', host: '' });
        });

        it('should throw when the separator is missing', () => {
            expect(() => splitConnectionString('no-separator'))
                .toThrow(ConnectionStringParseError);
        });

        it('should throw when there is more than one separator', () => {
            expect(() => splitConnectionString('a@b@c'))
                .toThrow(ConnectionStringParseError);
        });

        it('should surface a custom error message', () => {
            let error: unknown;
            try {
                splitConnectionString('broken', { message: 'custom hint' });
            } catch (e) {
                error = e;
            }

            expect(isConnectionStringParseError(error)).toBe(true);
            expect((error as ConnectionStringParseError).message).toBe('custom hint');
        });
    });

    describe('resolveConnectionOptions', () => {
        const parse = (value: string) => ({ value });

        it('should parse the connection string when given', () => {
            expect(resolveConnectionOptions({ connectionString: 'abc' }, parse))
                .toEqual({ value: 'abc' });
        });

        it('should let explicit options take precedence over the string', () => {
            expect(resolveConnectionOptions(
                { connectionString: 'abc', connectionOptions: { value: 'explicit' } },
                parse,
            )).toEqual({ value: 'explicit' });
        });

        it('should not parse the connection string when explicit options are present', () => {
            const failing = () => { throw new ConnectionStringParseError('should not run'); };

            expect(resolveConnectionOptions(
                { connectionString: 'malformed', connectionOptions: { value: 'explicit' } },
                failing,
            )).toEqual({ value: 'explicit' });
        });

        it('should use explicit options without a connection string', () => {
            expect(resolveConnectionOptions({ connectionOptions: { value: 'x' } }, parse))
                .toEqual({ value: 'x' });
        });

        it('should return undefined when neither is provided', () => {
            expect(resolveConnectionOptions({}, parse)).toBeUndefined();
        });

        it('should propagate a parse error', () => {
            const failing = () => { throw new ConnectionStringParseError('bad'); };
            expect(() => resolveConnectionOptions({ connectionString: 'abc' }, failing))
                .toThrow(ConnectionStringParseError);
        });
    });

    describe('ConnectionStringParseError', () => {
        it('should be recognised as a hapic error', () => {
            const error = new ConnectionStringParseError();

            expect(isConnectionStringParseError(error)).toBe(true);
            expect(isHapicError(error)).toBe(true);
            expect(error.code).toBe('connection_string_invalid');
        });

        it('should guard against non-matching values', () => {
            expect(isConnectionStringParseError(new Error('x'))).toBe(false);
            expect(isConnectionStringParseError({})).toBe(false);
            expect(isConnectionStringParseError(undefined)).toBe(false);
        });
    });
});
