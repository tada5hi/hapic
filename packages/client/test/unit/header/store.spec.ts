/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HeaderStore,
    Headers,
} from '../../../src';
import type { HeaderContainer } from '../../../src';

const containers: Record<string, () => HeaderContainer> = {
    Headers: () => {
        const headers = new Headers();
        headers.set('Authorization', 'foo');
        return headers;
    },
    tuples: () => [['Authorization', 'foo']],
    record: () => ({ Authorization: 'foo' }),
};

describe('src/header/store', () => {
    for (const [name, build] of Object.entries(containers)) {
        describe(`container: ${name}`, () => {
            it('should get a header case-insensitively', () => {
                const store = new HeaderStore(build());

                expect(store.get('Authorization')).toEqual('foo');
                expect(store.get('authorization')).toEqual('foo');
                expect(store.get('missing')).toBeUndefined();
            });

            it('should report presence via has', () => {
                const store = new HeaderStore(build());

                expect(store.has('AUTHORIZATION')).toBe(true);
                expect(store.has('missing')).toBe(false);
            });

            it('should overwrite an existing header case-insensitively', () => {
                const store = new HeaderStore(build());

                store.set('authorization', 'bar');

                expect(store.get('Authorization')).toEqual('bar');
                expect(store.get('authorization')).toEqual('bar');
            });

            it('should add a new header', () => {
                const store = new HeaderStore(build());

                store.set('X-Tenant', 'acme');

                expect(store.get('x-tenant')).toEqual('acme');
            });

            it('should unset a header case-insensitively', () => {
                const store = new HeaderStore(build());

                store.unset('authorization');

                expect(store.has('authorization')).toBe(false);
                expect(store.get('Authorization')).toBeUndefined();
            });

            it('should iterate every entry', () => {
                const store = new HeaderStore(build());
                store.set('x-tenant', 'acme');

                const seen: Record<string, any> = {};
                store.forEach((value, key) => {
                    seen[key.toLowerCase()] = value;
                });

                expect(seen).toEqual({ authorization: 'foo', 'x-tenant': 'acme' });
            });

            it('should mutate the wrapped container in place', () => {
                const container = build();
                new HeaderStore(container).set('x-req', 'b');

                // a fresh view over the same reference observes the mutation
                expect(new HeaderStore(container).get('x-req')).toEqual('b');
            });
        });
    }

    it('should default to an empty record container', () => {
        const store = new HeaderStore();

        expect(store.get('authorization')).toBeUndefined();

        store.set('accept', 'application/json');
        expect(store.get('accept')).toEqual('application/json');
    });

    describe('merge', () => {
        it('should overwrite existing keys by default', () => {
            const target = new HeaderStore({ 'x-both': 'target' });

            target.merge({ 'x-both': 'source', 'x-source': 'only' });

            expect(target.get('x-both')).toEqual('source');
            expect(target.get('x-source')).toEqual('only');
        });

        it('should only fill absent keys when overwrite is false', () => {
            const target = new HeaderStore(new Headers({ 'x-both': 'target' }));

            target.merge({ 'x-both': 'source', 'x-default': 'd' }, { overwrite: false });

            expect(target.get('x-both')).toEqual('target');
            expect(target.get('x-default')).toEqual('d');
        });

        it('should merge across differing container shapes', () => {
            const target = new HeaderStore([['x-keep', 'a']]);

            target.merge(new Headers({ 'x-add': 'b' }));

            expect(target.get('x-keep')).toEqual('a');
            expect(target.get('x-add')).toEqual('b');
        });
    });
});
