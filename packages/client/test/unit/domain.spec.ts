/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BaseAPIContext, IClient } from '../../src';
import {
    BaseAPI,
    Client,
    MemoryTransport,
    createClient,
    isClient,
} from '../../src';

type Options = {
    fooURL?: string,
    name?: string,
};

class FooAPI extends BaseAPI<Options> {
    constructor(context: BaseAPIContext<Options> = {}) {
        super(context);
    }

    getClient() : IClient {
        return this.client;
    }

    getOptions() : Options {
        return this.options;
    }

    async ping() {
        return this.client.get('ping', { ...this.withBaseURL(this.options.fooURL) });
    }

    resolveBaseURL(input?: string) {
        return this.withBaseURL(input);
    }
}

describe('src/domain', () => {
    it('should use a passed client', () => {
        const client = createClient();
        const api = new FooAPI({ client });

        expect(api.getClient()).toBe(client);
    });

    it('should create a client from raw request options', () => {
        const api = new FooAPI({ client: { baseURL: 'https://example.com/' } });

        const client = api.getClient();

        expect(isClient(client)).toBeTruthy();
        expect(client).toBeInstanceOf(Client);
        expect(client.getBaseURL()).toBe('https://example.com/');
    });

    it('should create a client and empty options without arguments', () => {
        const api = new FooAPI();

        expect(isClient(api.getClient())).toBeTruthy();
        expect(api.getOptions()).toEqual({});
    });

    it('should replace the client with setClient', () => {
        const api = new FooAPI();

        const client = createClient();

        api.setClient(client);
        expect(api.getClient()).toBe(client);

        api.setClient({ baseURL: 'https://other.example.com/' });
        expect(api.getClient()).not.toBe(client);
        expect(api.getClient().getBaseURL()).toBe('https://other.example.com/');
    });

    it('should hold the passed options by reference', () => {
        const options : Options = {};

        const a = new FooAPI({ options });
        const b = new FooAPI({ options });

        expect(a.getOptions()).toBe(options);

        a.setOption('name', 'foo');
        expect(b.getOptions().name).toBe('foo');
        expect(options.name).toBe('foo');
    });

    it('should replace the options with setOptions', () => {
        const options : Options = { name: 'foo' };
        const api = new FooAPI({ options });

        api.setOptions({ name: 'bar' });
        expect(api.getOptions()).toEqual({ name: 'bar' });
        expect(options.name).toBe('foo');

        api.setOptions();
        expect(api.getOptions()).toEqual({});
    });

    it('should only provide a baseURL override when one is set', () => {
        const api = new FooAPI();

        expect(api.resolveBaseURL()).toEqual({});
        expect(api.resolveBaseURL('')).toEqual({});
        expect(api.resolveBaseURL('https://foo.example.com/')).toEqual({ baseURL: 'https://foo.example.com/' });
    });

    it('should send the request against the override base URL when set', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const client = createClient({ transport, baseURL: 'https://default.example.com/' });
        const api = new FooAPI({ client });

        await api.ping();
        expect(transport.requests.at(-1)!.url).toBe('https://default.example.com/ping');

        api.setOption('fooURL', 'https://foo.example.com/');

        await api.ping();
        expect(transport.requests.at(-1)!.url).toBe('https://foo.example.com/ping');
    });
});
