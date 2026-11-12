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
            q: { name: 'foo' },
        });

        expect(qs).toEqual('?page_size=10&page=1&q=name%3Dfoo');
    });

    /*
     * Harbor decodes `q` twice before parsing it (lib/q/builder.go):
     * 1. the regular query decoding of the HTTP server (`%XX`, `+` -> space)
     * 2. `url.QueryUnescape(q)` in `parseKeywords`
     * and only then splits it on `,` into `key=value` pairs.
     */
    const queryUnescape = (input: string) => decodeURIComponent(input.replace(/\+/g, ' '));
    const decodeQ = (qs: string) => queryUnescape(queryUnescape(new URL(`http://h/${qs}`).search.match(/[?&]q=([^&]*)/)![1]));

    it('should join multiple q keys with a comma', () => {
        const qs = buildQueryString({ q: { Level: 'project', ProjectID: 1 } });

        expect(qs).toEqual('?q=Level%3Dproject%2CProjectID%3D1');
        expect(decodeQ(qs)).toEqual('Level=project,ProjectID=1');
    });

    it('should encode q values so they survive the double decoding', () => {
        const qs = buildQueryString({ q: { name: 'a/b c%d+e' } });

        expect(qs).toEqual('?q=name%3Da%252Fb%2Bc%2525d%252Be');
        expect(decodeQ(qs)).toEqual('name=a/b c%d+e');
    });

    it('should keep the fuzzy match prefix', () => {
        const qs = buildQueryString({ q: { name: '~bar' } });

        expect(qs).toEqual('?q=name%3D%257Ebar');
        expect(decodeQ(qs)).toEqual('name=~bar');
    });

    it('should join sort fields with a comma', () => {
        expect(buildQueryString({ sort: ['-name', 'id'] })).toEqual('?sort=-name%2Cid');
    });
});
