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
import { UserInfoAPI } from '../../../../src';

function waitForAbort(request: TransportRequest) : Promise<never> {
    return new Promise((_resolve, reject) => {
        const { signal } = request;

        if (!signal) {
            return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
}

describe('src/domains/userinfo (request options)', () => {
    it('should hand the signal to the transport', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { name: 'admin' },
            }),
        });
        const api = new UserInfoAPI({ client: createClient({ transport }) });
        const controller = new AbortController();

        await api.get('token', { signal: controller.signal });

        const request = transport.requests.at(-1)!;

        expect(request.signal).toBe(controller.signal);
        expect(Object.hasOwn(request, 'timeout')).toBe(false);
        expect((request.headers as Headers).get('authorization')).toBe('Bearer token');
    });

    it('should time out with the timeout option', async () => {
        const transport = new MemoryTransport({ fetch: (request) => waitForAbort(request) });
        const api = new UserInfoAPI({ client: createClient({ transport }) });

        let error : unknown;

        try {
            await api.get('token', { timeout: 20 });
        } catch (e) {
            error = e;
        }

        expect(isClientError(error) && error.code).toBe(ErrorCode.CONNECTION_TIMEOUT);
        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should keep the client timeout without a timeout option', async () => {
        const transport = new MemoryTransport({ fetch: (request) => waitForAbort(request) });
        const api = new UserInfoAPI({ client: createClient({ transport, timeout: 20 }) });

        let error : unknown;

        try {
            await api.get('token', {});
        } catch (e) {
            error = e;
        }

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });
});
