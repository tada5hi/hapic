import type { ClientRegistry, ClientRegistryOptions, IClient  } from './types';
/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasOwnProperty, matchesInstanceof } from './utils';

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

    const isClient = (input: unknown) : input is T => matchesInstanceof(input, options.id);

    return {
        hasClient,
        setClient,
        useClient,
        unsetClient,
        createClient,
        isClient,
    };
}
