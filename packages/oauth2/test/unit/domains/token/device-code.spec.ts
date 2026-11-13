/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MemoryResponseInit, TransportRequest } from 'hapic';
import { MemoryTransport, createClient, isHttpResponseError } from 'hapic';
import type { Options, TokenGrantResponse } from '../../../../src';
import { TokenAPI } from '../../../../src';

const tokenGrantResponse : TokenGrantResponse = {
    access_token: 'access_token',
    expires_in: 3600,
    token_type: 'Bearer',
};

const DEVICE_CODE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:device_code';

function createErrorResponse(error: string) : MemoryResponseInit {
    return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { error },
    };
}

function createSuccessResponse() : MemoryResponseInit {
    return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: tokenGrantResponse,
    };
}

/**
 * Answer the n-th request with the n-th response; the last one repeats.
 */
function createTransport(responses: MemoryResponseInit[]) {
    let index = 0;

    return new MemoryTransport({
        fetch: () => {
            const response = responses[Math.min(index, responses.length - 1)];

            index++;

            return response;
        },
    });
}

function createAPI(transport: MemoryTransport, options: Options = {}) {
    return new TokenAPI({ client: createClient({ transport }), options });
}

function getBody(request: TransportRequest) : Record<string, string> {
    return Object.fromEntries(new URLSearchParams(request.body as any));
}

describe('src/domains/token (device code)', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should post the device code grant', async () => {
        const transport = createTransport([createSuccessResponse()]);
        const api = createAPI(transport, {
            clientId: 'client',
            scope: ['openid'],
            tokenEndpoint: 'https://example.com/token',
        });

        const token = await api.createWithDeviceCode({ device_code: 'device' });

        expect(token).toEqual(tokenGrantResponse);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('https://example.com/token');
        // scope is no parameter of the device access token request (RFC 8628 3.4)
        expect(getBody(request)).toEqual({
            grant_type: DEVICE_CODE_GRANT_TYPE,
            device_code: 'device',
            client_id: 'client',
        });
    });

    it('should wait the interval before each request until the token is issued', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createErrorResponse('authorization_pending'),
            createSuccessResponse(),
        ]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({ device_code: 'device', interval: 2 });

        await vi.advanceTimersByTimeAsync(1999);
        expect(transport.requests).toHaveLength(0);

        await vi.advanceTimersByTimeAsync(1);
        expect(transport.requests).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(2000);
        expect(transport.requests).toHaveLength(2);

        await vi.advanceTimersByTimeAsync(2000);
        expect(transport.requests).toHaveLength(3);

        await expect(promise).resolves.toEqual(tokenGrantResponse);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should wait five seconds without an interval', async () => {
        vi.useFakeTimers();

        const transport = createTransport([createSuccessResponse()]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({ device_code: 'device' });

        await vi.advanceTimersByTimeAsync(4999);
        expect(transport.requests).toHaveLength(0);

        await vi.advanceTimersByTimeAsync(1);
        await expect(promise).resolves.toEqual(tokenGrantResponse);
    });

    it('should add five seconds to the interval on slow_down', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('slow_down'),
            createErrorResponse('authorization_pending'),
            createSuccessResponse(),
        ]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({ device_code: 'device', interval: 1 });

        await vi.advanceTimersByTimeAsync(1000);
        expect(transport.requests).toHaveLength(1);

        // the interval is now 6 seconds, for this and all subsequent requests
        await vi.advanceTimersByTimeAsync(5999);
        expect(transport.requests).toHaveLength(1);

        await vi.advanceTimersByTimeAsync(1);
        expect(transport.requests).toHaveLength(2);

        await vi.advanceTimersByTimeAsync(5999);
        expect(transport.requests).toHaveLength(2);

        await vi.advanceTimersByTimeAsync(1);
        await expect(promise).resolves.toEqual(tokenGrantResponse);
    });

    it('should throw any other error as is', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createErrorResponse('access_denied'),
        ]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({ device_code: 'device', interval: 1 });
        const assertion = expect(promise).rejects.toSatisfy(
            (error) => isHttpResponseError(error) &&
                error.response?.data?.error === 'access_denied',
        );

        await vi.advanceTimersByTimeAsync(2000);
        await assertion;

        expect(transport.requests).toHaveLength(2);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should throw the last pending error when the next wait ends past the deadline', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createErrorResponse('slow_down'),
        ]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({
            device_code: 'device',
            interval: 5,
            expires_in: 12,
        });
        const assertion = expect(promise).rejects.toSatisfy(
            (error) => isHttpResponseError(error) &&
                error.response?.data?.error === 'slow_down',
        );

        // requests at 5s and 10s; the next one (at 20s, after slow_down) would end past 12s
        await vi.advanceTimersByTimeAsync(10_000);
        await assertion;

        expect(transport.requests).toHaveLength(2);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should always make at least one request', async () => {
        vi.useFakeTimers();

        const transport = createTransport([createErrorResponse('authorization_pending')]);
        const api = createAPI(transport, { clientId: 'client' });

        const promise = api.pollWithDeviceCode({
            device_code: 'device',
            interval: 5,
            expires_in: 1,
        });
        const assertion = expect(promise).rejects.toSatisfy(
            (error) => isHttpResponseError(error) &&
                error.response?.data?.error === 'authorization_pending',
        );

        await vi.advanceTimersByTimeAsync(5000);
        await assertion;

        expect(transport.requests).toHaveLength(1);
    });

    it('should reject with the signal reason when aborted while waiting', async () => {
        vi.useFakeTimers();

        const transport = createTransport([createErrorResponse('authorization_pending')]);
        const api = createAPI(transport, { clientId: 'client' });
        const controller = new AbortController();
        const reason = new Error('cancelled');

        const promise = api.pollWithDeviceCode(
            { device_code: 'device', interval: 5 },
            { signal: controller.signal },
        );
        const assertion = expect(promise).rejects.toBe(reason);

        await vi.advanceTimersByTimeAsync(7000);
        expect(transport.requests).toHaveLength(1);

        controller.abort(reason);
        await assertion;

        expect(transport.requests).toHaveLength(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should reject at once with an aborted signal', async () => {
        vi.useFakeTimers();

        const transport = createTransport([createSuccessResponse()]);
        const api = createAPI(transport, { clientId: 'client' });
        const reason = new Error('cancelled');

        await expect(api.pollWithDeviceCode(
            { device_code: 'device' },
            { signal: AbortSignal.abort(reason) },
        )).rejects.toBe(reason);

        expect(transport.requests).toHaveLength(0);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should hand the signal to each request', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createSuccessResponse(),
        ]);
        const api = createAPI(transport, { clientId: 'client' });
        const controller = new AbortController();

        const promise = api.pollWithDeviceCode(
            { device_code: 'device', interval: 1 },
            { signal: controller.signal },
        );

        await vi.advanceTimersByTimeAsync(2000);
        await expect(promise).resolves.toEqual(tokenGrantResponse);

        transport.requests.forEach((request) => {
            expect(request.signal).toBe(controller.signal);
        });
    });

    it('should send only the device code and the client authentication', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createSuccessResponse(),
        ]);
        const api = createAPI(transport, {
            clientId: 'client',
            clientSecret: 'secret',
            realmId: 'realm',
            scope: 'openid',
        });

        const promise = api.pollWithDeviceCode({
            device_code: 'device',
            user_code: 'WDJB-MJHT',
            verification_uri: 'https://example.com/device',
            verification_uri_complete: 'https://example.com/device?user_code=WDJB-MJHT',
            expires_in: 1800,
            interval: 1,
        } as any);

        await vi.advanceTimersByTimeAsync(2000);
        await expect(promise).resolves.toEqual(tokenGrantResponse);

        expect(transport.requests).toHaveLength(2);
        transport.requests.forEach((request) => {
            expect(getBody(request)).toEqual({
                grant_type: DEVICE_CODE_GRANT_TYPE,
                device_code: 'device',
                client_id: 'client',
                client_secret: 'secret',
                realm_id: 'realm',
            });
        });
    });

    it('should apply the header rules on each request', async () => {
        vi.useFakeTimers();

        const transport = createTransport([
            createErrorResponse('authorization_pending'),
            createSuccessResponse(),
        ]);
        const api = createAPI(transport, { clientId: 'client', clientSecret: 'secret' });

        const promise = api.pollWithDeviceCode(
            { device_code: 'device', interval: 1 },
            { clientCredentialsAsHeader: true },
        );

        await vi.advanceTimersByTimeAsync(2000);
        await expect(promise).resolves.toEqual(tokenGrantResponse);

        expect(transport.requests).toHaveLength(2);
        transport.requests.forEach((request) => {
            expect(new Headers(request.headers).get('Authorization')).toMatch(/^Basic /);
            expect(getBody(request)).toEqual({
                grant_type: DEVICE_CODE_GRANT_TYPE,
                device_code: 'device',
            });
        });
    });
});
