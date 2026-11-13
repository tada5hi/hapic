/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers, stringifyAuthorizationHeader } from 'hapic';
import {
    createRequestTransformerForTokenAPIRequest,
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
});
