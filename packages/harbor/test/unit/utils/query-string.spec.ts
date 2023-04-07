/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueryString } from '../../../src';

describe('src/utils/query-string', () => {
    it('should build query string', () => {
        const qs = buildQueryString({
            page_size: 10,
            page: 1,
        });

        expect(qs).toEqual('?page_size=10&page=1');
    });

    it('should build query string with q argument', () => {
        const qs = buildQueryString({
            page_size: 10,
            page: 1,
            q: {
                name: 'foo',
            },
        });

        expect(qs).toEqual('?page_size=10&page=1&q=name%3Dfoo');
    });
});
