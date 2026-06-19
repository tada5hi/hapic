/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AuthorizationHeaderError,
    ClientError,
    HapicError,
    HttpResponseError,
    NetworkError,
    createClientError,
    isAuthorizationHeaderError,
    isClientError,
    isHapicError,
    isHttpResponseError,
    isNetworkError,
} from '../../../src';

describe('src/error/hierarchy', () => {
    it('should treat an HttpResponseError as a ClientError (multiple instanceof references)', () => {
        const error = new HttpResponseError({
            request: { url: 'http://localhost/' },
            message: 'not found',
            response: { status: 404, statusText: 'Not Found' } as any,
        });

        // ancestor + own guard both match the single instance
        expect(isHttpResponseError(error)).toBe(true);
        expect(isClientError(error)).toBe(true);
        expect(isNetworkError(error)).toBe(false);

        expect(error instanceof HttpResponseError).toBe(true);
        expect(error instanceof ClientError).toBe(true);

        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
    });

    it('should treat a NetworkError as a ClientError', () => {
        const error = new NetworkError({
            request: { url: 'http://localhost/' },
            message: 'connection refused',
        });

        expect(isNetworkError(error)).toBe(true);
        expect(isClientError(error)).toBe(true);
        expect(isHttpResponseError(error)).toBe(false);
        expect(error.response).toBeUndefined();
    });

    it('should select the subclass in createClientError by presence of a response', () => {
        const httpError = createClientError({
            request: { url: 'x', method: 'GET' },
            response: { status: 500, statusText: 'Internal Server Error' } as any,
        });
        expect(isHttpResponseError(httpError)).toBe(true);
        expect(isClientError(httpError)).toBe(true);

        const networkError = createClientError({ request: { url: 'x', method: 'GET' } });
        expect(isNetworkError(networkError)).toBe(true);
        expect(isClientError(networkError)).toBe(true);
    });

    it('should detect errors across realms via the @instanceof marker chain', () => {
        const fake = { '@instanceof': [Symbol.for('hapic/ClientError'), Symbol.for('hapic/HttpResponseError')] };

        expect(isClientError(fake)).toBe(true);
        expect(isHttpResponseError(fake)).toBe(true);
        expect(isNetworkError(fake)).toBe(false);
    });

    it('should recognise an AuthorizationHeaderError but not confuse it with a ClientError', () => {
        const error = new AuthorizationHeaderError();

        expect(isAuthorizationHeaderError(error)).toBe(true);
        expect(isClientError(error)).toBe(false);
    });

    it('should recognise every hapic error via isHapicError, regardless of type', () => {
        const httpError = new HttpResponseError({
            request: { url: 'x' },
            message: 'm',
            response: { status: 404, statusText: 'Not Found' } as any,
        });
        const networkError = new NetworkError({ request: { url: 'x' }, message: 'm' });
        const authError = new AuthorizationHeaderError();

        expect(isHapicError(httpError)).toBe(true);
        expect(isHapicError(networkError)).toBe(true);
        expect(isHapicError(authError)).toBe(true); // not a ClientError, still a HapicError
        expect(isHapicError(new Error('x'))).toBe(false);
        expect(isHapicError(undefined)).toBe(false);

        expect(httpError).toBeInstanceOf(HapicError);
        expect(authError).toBeInstanceOf(HapicError);

        // chain: BaseError -> HapicError -> ClientError -> HttpResponseError
        expect((httpError as any)['@instanceof'].map((s: symbol) => s.toString())).toEqual([
            'Symbol(@ebec/core/BaseError)',
            'Symbol(hapic/HapicError)',
            'Symbol(hapic/ClientError)',
            'Symbol(hapic/HttpResponseError)',
        ]);
    });
});
