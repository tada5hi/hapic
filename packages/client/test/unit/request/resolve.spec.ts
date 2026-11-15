/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from '../../../src';
import { Headers } from '../../../src';
import { resolveRequestOptions } from '../../../src/request/resolve';

describe('src/request/resolve', () => {
    it('should take options from the defaults when the request does not set them', () => {
        const defaultTransform = (data: any) => data;
        const defaults : RequestBaseOptions = {
            baseURL: 'https://api.test/',
            proxy: true,
            transform: [defaultTransform],
            credentials: 'include',
        };

        const options = resolveRequestOptions({
            defaults,
            headers: new Headers(),
            config: { url: 'users', method: 'GET' },
        });

        expect(options.proxy).toBe(true);
        expect(options.transform).toEqual([defaultTransform]);
        expect(options.credentials).toBe('include');
        expect(options.method).toBe('GET');
        expect(options.url).toBe('https://api.test/users');
    });

    it('should replace (not merge) transform, responseTransform, params and query', () => {
        const defaultTransform = (data: any) => data;
        const requestTransform = (data: any) => data;
        const defaultResponseTransform = (data: any) => data;
        const requestResponseTransform = (data: any) => data;

        const options = resolveRequestOptions({
            defaults: {
                transform: [defaultTransform],
                responseTransform: [defaultResponseTransform],
                params: { a: '1' },
                query: { b: '2' },
            },
            headers: new Headers(),
            config: {
                url: 'https://api.test/users',
                transform: requestTransform,
                responseTransform: requestResponseTransform,
                params: { c: '3' },
                query: { d: '4' },
            },
        });

        expect(options.transform).toBe(requestTransform);
        expect(options.responseTransform).toBe(requestResponseTransform);
        expect(options.params).toEqual({ c: '3' });
        expect(options.query).toEqual({ d: '4' });

        const url = new URL(options.url);

        expect(url.searchParams.keys().toArray().sort()).toEqual(['c', 'd']);
    });

    it('should apply default params and query when the request sets none', () => {
        const options = resolveRequestOptions({
            defaults: { params: { a: '1' }, query: { b: '2' } },
            headers: new Headers(),
            config: { url: 'https://api.test/users' },
        });

        const url = new URL(options.url);

        expect(url.searchParams.get('a')).toBe('1');
        expect(url.searchParams.get('b')).toBe('2');
    });

    it('should merge params and query into the url, query winning and bigint stringified', () => {
        const options = resolveRequestOptions({
            defaults: {},
            headers: new Headers(),
            config: {
                url: 'https://api.test/users',
                params: { page: 1, shared: 'params' },
                query: { shared: 'query', big: 9007199254740993n },
            },
        });

        const url = new URL(options.url);

        expect(url.searchParams.get('page')).toBe('1');
        expect(url.searchParams.get('shared')).toBe('query');
        expect(url.searchParams.get('big')).toBe('9007199254740993');
    });

    it('should layer per-request headers over the client headers', () => {
        const options = resolveRequestOptions({
            defaults: {},
            headers: new Headers({ 'x-default': 'a', 'x-both': 'default' }),
            config: {
                url: 'https://api.test/',
                headers: { 'X-Both': 'override', 'x-req': 'b' },
            },
        });

        const headers = options.headers as Headers;

        expect(headers).toBeInstanceOf(Headers);
        expect(headers.get('x-default')).toBe('a');
        expect(headers.get('x-both')).toBe('override');
        expect(headers.get('x-req')).toBe('b');
    });

    it('should not mutate the client headers', () => {
        const clientHeaders = new Headers({ 'x-default': 'a' });

        const options = resolveRequestOptions({
            defaults: {},
            headers: clientHeaders,
            config: { url: 'https://api.test/', headers: { 'x-req': 'b' } },
        });

        (options.headers as Headers).set('x-hook', 'c');

        expect(clientHeaders.has('x-req')).toBe(false);
        expect(clientHeaders.has('x-hook')).toBe(false);
    });

    it('should prefer the per-request baseURL and keep absolute urls without one', () => {
        const withRequestBase = resolveRequestOptions({
            defaults: { baseURL: 'https://default.test/' },
            headers: new Headers(),
            config: { url: 'users', baseURL: 'https://request.test/' },
        });

        expect(withRequestBase.url).toBe('https://request.test/users');

        const withoutBase = resolveRequestOptions({
            defaults: {},
            headers: new Headers(),
            config: { url: 'https://api.test/users' },
        });

        expect(withoutBase.url).toBe('https://api.test/users');
    });

    it('should keep the default signal and timeout for an undefined per-request value only', () => {
        const controller = new AbortController();
        const defaults : RequestBaseOptions = {
            credentials: 'include',
            signal: controller.signal,
            timeout: 1000,
        };

        const options = resolveRequestOptions({
            defaults,
            headers: new Headers(),
            config: {
                url: 'users',
                credentials: undefined,
                signal: undefined,
                timeout: undefined,
            },
        });

        expect(options.signal).toBe(controller.signal);
        expect(options.timeout).toBe(1000);
        expect(options.credentials).toBeUndefined();
    });
});
