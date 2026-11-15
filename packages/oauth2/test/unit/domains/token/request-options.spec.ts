/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportRequest } from 'hapic';
import {
    ErrorCode,
    MemoryTransport,
    createClient,
    isClientError,
    isClientErrorDueTimeout,
} from 'hapic';
import type { TokenBaseOptions } from '../../../../src';
import { TokenAPI } from '../../../../src';

type TokenCall = (api: TokenAPI, options: TokenBaseOptions) => Promise<unknown>;

const calls : [string, TokenCall][] = [
    ['create', (api, options) => api.createWithClientCredentials({ client_id: 'foo', client_secret: 'bar' }, options)],
    ['introspect', (api, options) => api.introspect({ token: 'foo' }, options)],
    ['revoke', (api, options) => api.revoke({ token: 'foo' }, options)],
];

function waitForAbort(request: TransportRequest) : Promise<never> {
    return new Promise((_resolve, reject) => {
        const { signal } = request;

        if (!signal) {
            return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
}

describe('src/domains/token (request options)', () => {
    it.each(calls)('should hand the signal of %s to the transport', async (_name, call) => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {
                    access_token: 'foo',
                    expires_in: 3600,
                    active: true,
                },
            }),
        });
        const api = new TokenAPI({ client: createClient({ transport }) });
        const controller = new AbortController();

        await call(api, { signal: controller.signal });

        const request = transport.requests.at(-1)!;

        expect(request.signal).toBe(controller.signal);
        expect(Object.hasOwn(request, 'timeout')).toBe(false);
    });

    it.each(calls)('should time out %s with the timeout option', async (_name, call) => {
        const transport = new MemoryTransport({ fetch: (request) => waitForAbort(request) });
        const api = new TokenAPI({ client: createClient({ transport }) });

        let error : unknown;

        try {
            await call(api, { timeout: 20 });
        } catch (e) {
            error = e;
        }

        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it.each(calls)('should keep the client timeout for %s without a timeout option', async (_name, call) => {
        const transport = new MemoryTransport({ fetch: (request) => waitForAbort(request) });
        const api = new TokenAPI({ client: createClient({ transport, timeout: 20 }) });

        let error : unknown;

        try {
            await call(api, {});
        } catch (e) {
            error = e;
        }

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });
});
