/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient, isClient } from '../instance';
import type { RequestBaseOptions } from '../request';
import type { IClient } from '../types';
import type { BaseAPIContext } from './types';

/**
 * Shared base for the domain objects of a service client.
 *
 * It holds the client requests are issued through and an options object,
 * which is kept by reference so that all domain objects of one service
 * client can share it.
 */
export abstract class BaseAPI<
    OPTIONS extends Record<string, any> = Record<string, any>,
> {
    protected client!: IClient;

    protected options!: OPTIONS;

    // -----------------------------------------------------------------------------------

    constructor(context: BaseAPIContext<OPTIONS> = {}) {
        this.setClient(context.client);
        this.setOptions(context.options);
    }

    // -----------------------------------------------------------------------------------

    /**
     * Use the given client, or create a dedicated one from request options.
     *
     * @param input
     */
    setClient(input?: IClient | RequestBaseOptions) {
        this.client = isClient(input) ?
            input :
            createClient(input);
    }

    /**
     * Replace the options object (an empty object when omitted).
     *
     * @param options
     */
    setOptions(options?: OPTIONS) {
        this.options = options || ({} as OPTIONS);
    }

    /**
     * Set a single option on the (possibly shared) options object.
     *
     * @param key
     * @param value
     */
    setOption<K extends keyof OPTIONS>(key: K, value: OPTIONS[K]) {
        this.options[key] = value;
    }

    // -----------------------------------------------------------------------------------

    /**
     * Build the request options which override the client's base URL,
     * when a (non-empty) base URL is given.
     *
     * @param baseURL
     */
    protected withBaseURL(baseURL?: string) : Pick<RequestBaseOptions, 'baseURL'> {
        return baseURL ? { baseURL } : {};
    }
}
