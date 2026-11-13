/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers, createClient, stringifyAuthorizationHeader } from 'hapic';
import {
    buildRequestOptionsForTokenAPIRequest,
    buildRequestTransformersForTokenAPIRequest,
    buildURLSearchParamsForTokenAPIRequest,
    createRequestTransformerForTokenAPIRequest,
    extendClientAuthenticationParameters,
    transformHeadersForTokenAPIRequest,
} from '../../../../src';

describe('src/domains/token (exports)', () => {
    it('should export the header transformation from the package root', () => {
        const headers = new Headers();

        headers.set('Authorization', 'Bearer foo');

        transformHeadersForTokenAPIRequest(headers);

        expect(headers.has('Authorization')).toBe(false);
        expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    });

    it('should export the request transformer from the package root', () => {
        const headers = new Headers();
        const transformer = createRequestTransformerForTokenAPIRequest(
            { client_id: 'client', client_secret: 'secret' },
            { clientCredentialsAsHeader: true },
        );

        const data = transformer(
            new URLSearchParams({
                client_id: 'client',
                client_secret: 'secret',
                grant_type: 'foo',
            }),
            headers,
        ) as URLSearchParams;

        expect(data.has('client_id')).toBe(false);
        expect(data.has('client_secret')).toBe(false);
        expect(headers.get('Authorization')).toBe(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'client',
            password: 'secret',
        }));
    });

    it('should export the request building helpers from the package root', () => {
        const defaults = { clientId: 'client', clientSecret: 'secret' };
        const parameters = extendClientAuthenticationParameters({ scope: ['foo', 'bar'] }, defaults);

        expect(parameters).toEqual({
            scope: ['foo', 'bar'],
            client_id: 'client',
            client_secret: 'secret',
        });

        const body = buildURLSearchParamsForTokenAPIRequest(parameters);

        expect(body.get('scope')).toBe('foo bar');
        expect(body.get('client_id')).toBe('client');

        const controller = new AbortController();
        const transform = buildRequestTransformersForTokenAPIRequest(createClient(), defaults, parameters);
        const options = buildRequestOptionsForTokenAPIRequest(transform, { signal: controller.signal, timeout: 50 });

        expect(typeof transform[0]).toBe('function');
        expect(options.transform).toBe(transform);
        expect(options.signal).toBe(controller.signal);
        expect(options.timeout).toBe(50);
    });
});
