/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, createClientRegistry, markInstanceof } from '../../src';

const TEST_INSTANCE = Symbol.for('hapic-test/RegistryClient');

class RegistryClient extends Client {
    constructor() {
        super();
        // mirror how a real service client registers its own marker
        markInstanceof(this, TEST_INSTANCE);
    }
}

function buildRegistry() {
    return createClientRegistry<RegistryClient, undefined>({
        create: () => new RegistryClient(),
        id: TEST_INSTANCE,
    });
}

describe('src/registry', () => {
    it('should create a client without registering it', () => {
        const registry = buildRegistry();

        const client = registry.createClient();
        expect(client).toBeInstanceOf(RegistryClient);
        expect(registry.hasClient()).toBeFalsy();
    });

    it('should set & receive a client under the default key', () => {
        const registry = buildRegistry();

        expect(registry.hasClient()).toBeFalsy();

        const client = registry.setClient(registry.createClient());
        expect(registry.hasClient()).toBeTruthy();
        expect(registry.useClient()).toBe(client);
    });

    it('should get-or-create on useClient', () => {
        const registry = buildRegistry();

        expect(registry.hasClient()).toBeFalsy();

        const client = registry.useClient();
        expect(client).toBeInstanceOf(RegistryClient);
        expect(registry.hasClient()).toBeTruthy();
        // a second call returns the same lazily-created instance
        expect(registry.useClient()).toBe(client);
    });

    it('should keep separate clients per key', () => {
        const registry = buildRegistry();

        const a = registry.setClient(registry.createClient(), 'a');
        const b = registry.setClient(registry.createClient(), 'b');

        expect(a).not.toBe(b);
        expect(registry.useClient('a')).toBe(a);
        expect(registry.useClient('b')).toBe(b);
        expect(registry.hasClient('a')).toBeTruthy();
        expect(registry.hasClient('c')).toBeFalsy();
    });

    it('should unset a client', () => {
        const registry = buildRegistry();

        registry.setClient(registry.createClient());
        expect(registry.hasClient()).toBeTruthy();

        registry.unsetClient();
        expect(registry.hasClient()).toBeFalsy();

        // unsetting an absent key is a no-op
        expect(() => registry.unsetClient('missing')).not.toThrow();
    });

    it('should keep registries isolated from each other', () => {
        const a = buildRegistry();
        const b = buildRegistry();

        a.setClient(a.createClient());
        expect(a.hasClient()).toBeTruthy();
        expect(b.hasClient()).toBeFalsy();
    });

    it('should recognise its client via the marker symbol', () => {
        const registry = buildRegistry();

        expect(registry.isClient(registry.createClient())).toBeTruthy();
    });

    it('should recognise a cross-realm client by its marker chain', () => {
        const registry = buildRegistry();

        // simulate a client constructed by a duplicate package copy:
        // identity travels in the `@instanceof` marker chain (a symbol[]).
        const fakeClient = { '@instanceof': [TEST_INSTANCE] };
        expect(registry.isClient(fakeClient)).toBeTruthy();
    });

    it('should reject non-clients and clients of other registries', () => {
        const registry = buildRegistry();

        expect(registry.isClient(undefined)).toBeFalsy();
        expect(registry.isClient({})).toBeFalsy();
        // a base Client carries `hapic/Client`, not this registry's marker
        expect(registry.isClient(new Client())).toBeFalsy();
    });
});
