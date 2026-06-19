/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IClient } from './type';
import { hasInstanceof, hasOwnProperty } from './utils';

/**
 * The singleton-registry surface shared by the base package and every
 * `@hapic/*` service package: a keyed map of client instances plus a
 * cross-realm `isClient` guard.
 */
export type ClientRegistry<T extends IClient, I> = {
    /**
     * Verify if a client singleton instance exists for `key` (default `'default'`).
     */
    hasClient(key?: string): boolean;
    /**
     * Register `client` under `key` (default `'default'`) and return it.
     */
    setClient<C extends T = T>(client: C, key?: string): C;
    /**
     * Receive the singleton instance for `key` (default `'default'`),
     * lazily creating an empty one on first use.
     */
    useClient<C extends T = T>(key?: string): C;
    /**
     * Unset the client singleton instance registered under `key` (default `'default'`).
     */
    unsetClient(key?: string): void;
    /**
     * Construct a new client. Does **not** register it.
     */
    createClient(input?: I): T;
    /**
     * Check if the argument is an instance of the registry's client,
     * using a cross-realm `@instanceof` marker check.
     */
    isClient(input: unknown): input is T;
};

export type ClientRegistryOptions<T extends IClient, I> = {
    /**
     * Construct a new client from the given input.
     */
    create: (input?: I) => T;
    /**
     * The cross-realm `@instanceof` marker the client registers in its
     * constructor (e.g. `Symbol.for('@hapic/harbor/HarborClient')`).
     * Used by `isClient`.
     */
    id: symbol;
};

/**
 * Build a keyed singleton registry for a client type.
 *
 * Collapses the otherwise-duplicated `hasClient` / `setClient` / `useClient` /
 * `unsetClient` / `createClient` / `isClient` boilerplate into one place; each
 * package supplies only how to construct its client and the marker symbol that
 * identifies it.
 *
 * @param options
 */
export function createClientRegistry<T extends IClient, I>(
    options: ClientRegistryOptions<T, I>,
) : ClientRegistry<T, I> {
    // null-prototype storage: registry keys are arbitrary strings, so a key
    // like `__proto__` must be stored as plain data rather than mutate the map.
    const instances : Record<string, T> = Object.create(null) as Record<string, T>;

    const createClient = (input?: I) : T => options.create(input);

    const hasClient = (key?: string) : boolean => hasOwnProperty(instances, key || 'default');

    const setClient = <C extends T = T>(client: C, key?: string) : C => {
        instances[key || 'default'] = client;

        return client;
    };

    const useClient = <C extends T = T>(key?: string) : C => {
        key = key || 'default';

        if (Object.prototype.hasOwnProperty.call(instances, key)) {
            return instances[key] as C;
        }

        const instance = createClient();
        instances[key] = instance;

        return instance as C;
    };

    const unsetClient = (key?: string) : void => {
        key = key || 'default';

        if (hasOwnProperty(instances, key)) {
            delete instances[key];
        }
    };

    const isClient = (input: unknown) : input is T => hasInstanceof(input, options.id);

    return {
        hasClient,
        setClient,
        useClient,
        unsetClient,
        createClient,
        isClient,
    };
}
