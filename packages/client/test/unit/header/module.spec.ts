/*
 * Copyright (c) 2023-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Headers, getHeader, setHeader, unsetHeader,
} from '../../../src';

const checkSetUnset = (a : HeadersInit) => {
    expect(getHeader(a, 'Authorization')).toEqual('bar');
    expect(getHeader(a, 'authorization')).toEqual('bar');

    unsetHeader(a, 'authorization');

    expect(getHeader(a, 'Authorization')).toBeUndefined();
    expect(getHeader(a, 'authorization')).toBeUndefined();
};

describe('src/module/header', () => {
    it('should set/unset headers for plain object', () => {
        const a : Record<string, any> = {};
        a.Authorization = 'foo';

        setHeader(a, 'authorization', 'bar');

        checkSetUnset(a);
    });

    it('should set/unset header for HeadersInit object', () => {
        const a = new Headers();
        a.set('Authorization', 'foo');

        setHeader(a, 'authorization', 'bar');

        checkSetUnset(a);
    });

    it('should set/unset header for array', () => {
        const a: [string, string][] = [];
        a.push(['Authorization', 'foo']);

        setHeader(a, 'authorization', 'bar');

        checkSetUnset(a);
    });
});
