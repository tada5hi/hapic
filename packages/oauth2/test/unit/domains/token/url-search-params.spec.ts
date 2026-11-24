/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildURLSearchParamsForTokenAPIRequest } from '../../../../src';

describe('src/domains/token/utils (url search params)', () => {
    it('should keep number values', () => {
        const params = buildURLSearchParamsForTokenAPIRequest({
            grant_type: 'client_credentials',
            expires_in: 60,
            scope: 'a',
        });

        expect(params.toString()).toBe('grant_type=client_credentials&expires_in=60&scope=a');
    });

    it('should keep zero', () => {
        const params = buildURLSearchParamsForTokenAPIRequest({ expires_in: 0 });

        expect(params.get('expires_in')).toBe('0');
    });

    it('should keep boolean values', () => {
        const params = buildURLSearchParamsForTokenAPIRequest({ foo: true, bar: false });

        expect(params.get('foo')).toBe('true');
        expect(params.get('bar')).toBe('false');
    });

    it('should skip undefined, null and empty strings', () => {
        const params = buildURLSearchParamsForTokenAPIRequest({
            foo: undefined,
            bar: null,
            baz: '',
        });

        expect(params.toString()).toBe('');
    });
});
