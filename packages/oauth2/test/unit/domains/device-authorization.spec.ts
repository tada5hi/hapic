/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TransportRequest } from 'hapic';
import {
    MemoryTransport,
    createClient,
    isClientErrorDueTimeout,
    stringifyAuthorizationHeader,
} from 'hapic';
import type { DeviceAuthorizationResponse, Options } from '../../../src';
import { DeviceAuthorizationAPI, OAuth2Client } from '../../../src';

const deviceAuthorizationResponse : DeviceAuthorizationResponse = {
    device_code: 'GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS',
    user_code: 'WDJB-MJHT',
    verification_uri: 'https://example.com/device',
    verification_uri_complete: 'https://example.com/device?user_code=WDJB-MJHT',
    expires_in: 1800,
    interval: 5,
};

function createTransport(body: Record<string, any> = deviceAuthorizationResponse) {
    return new MemoryTransport({
        fetch: () => ({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body,
        }),
    });
}

function createAPI(transport: MemoryTransport, options: Options = {}) {
    return new DeviceAuthorizationAPI({ client: createClient({ transport }), options });
}

function getBody(request: TransportRequest) : URLSearchParams {
    return new URLSearchParams(request.body as any);
}

function getHeaders(request: TransportRequest) : Headers {
    return new Headers(request.headers);
}

function waitForAbort(request: TransportRequest) : Promise<never> {
    return new Promise((_resolve, reject) => {
        const { signal } = request;

        if (!signal) {
            return;
        }

        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
}

describe('src/domains/device-authorization', () => {
    it('should post a form body to the default endpoint', async () => {
        const transport = createTransport();
        const api = createAPI(transport);

        const response = await api.create({ client_id: 'client', scope: ['openid', 'profile'] });

        expect(response).toEqual(deviceAuthorizationResponse);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('/device_authorization');
        expect(Object.fromEntries(getBody(request))).toEqual({
            client_id: 'client',
            scope: 'openid profile',
        });

        const headers = getHeaders(request);

        expect(headers.get('Content-Type')).toMatch(/^application\/x-www-form-urlencoded/);
        expect(headers.get('Accept')).toBe('application/json');
    });

    it('should post to the configured endpoint', async () => {
        const transport = createTransport();
        const api = createAPI(transport, { deviceAuthorizationEndpoint: 'https://example.com/oauth/device' });

        await api.create({ client_id: 'client' });

        expect(transport.requests.at(-1)!.url).toBe('https://example.com/oauth/device');
    });

    it('should fill client credentials, realm and scope from the options', async () => {
        const transport = createTransport();
        const api = createAPI(transport, {
            clientId: 'client',
            clientSecret: 'secret',
            realmId: 'realm',
            scope: ['openid', 'email'],
        });

        await api.create();

        expect(Object.fromEntries(getBody(transport.requests.at(-1)!))).toEqual({
            client_id: 'client',
            client_secret: 'secret',
            realm_id: 'realm',
            scope: 'openid email',
        });
    });

    it('should prefer passed parameters over the options', async () => {
        const transport = createTransport();
        const api = createAPI(transport, {
            clientId: 'client',
            clientSecret: 'secret',
            scope: 'openid',
        });

        await api.create({ client_id: 'other', scope: 'email' });

        expect(Object.fromEntries(getBody(transport.requests.at(-1)!))).toEqual({
            client_id: 'other',
            scope: 'email',
        });
    });

    it('should keep only the known response fields', async () => {
        const transport = createTransport({
            device_code: 'device',
            user_code: 'user',
            verification_uri: 'https://example.com/device',
            expires_in: 600,
            foo: 'bar',
        });
        const api = createAPI(transport);

        const response = await api.create({ client_id: 'client' });

        expect(response).toEqual({
            device_code: 'device',
            user_code: 'user',
            verification_uri: 'https://example.com/device',
            expires_in: 600,
        });
    });

    it('should drop the client authorization header', async () => {
        const transport = createTransport();
        const client = createClient({ transport });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'api-token' });

        const api = new DeviceAuthorizationAPI({ client });

        await api.create({ client_id: 'client' });

        expect(getHeaders(transport.requests.at(-1)!).has('Authorization')).toBe(false);
    });

    it('should inherit the client authorization header on request', async () => {
        const transport = createTransport();
        const client = createClient({ transport });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'api-token' });

        const api = new DeviceAuthorizationAPI({ client });

        await api.create({ client_id: 'client' }, { authorizationHeaderInherit: true });

        expect(getHeaders(transport.requests.at(-1)!).get('Authorization')).toBe('Bearer api-token');
    });

    it('should use a custom authorization header', async () => {
        const transport = createTransport();
        const api = createAPI(transport);

        await api.create({}, { authorizationHeader: 'Bearer custom' });

        expect(getHeaders(transport.requests.at(-1)!).get('Authorization')).toBe('Bearer custom');
    });

    it('should send the client credentials as header', async () => {
        const transport = createTransport();
        const api = createAPI(transport, { clientId: 'client', clientSecret: 'secret' });

        await api.create({ scope: 'openid' }, { clientCredentialsAsHeader: true });

        const request = transport.requests.at(-1)!;

        expect(getHeaders(request).get('Authorization')).toBe(stringifyAuthorizationHeader({
            type: 'Basic',
            username: 'client',
            password: 'secret',
        }));
        expect(Object.fromEntries(getBody(request))).toEqual({ scope: 'openid' });
    });

    it('should keep the client default transformers', async () => {
        const transport = createTransport();
        const transform = vi.fn((data) => data);
        const api = new DeviceAuthorizationAPI({ client: createClient({ transport, transform }) });

        await api.create({ client_id: 'client' });

        expect(transform).toHaveBeenCalledTimes(1);
    });

    it('should hand the signal to the transport', async () => {
        const transport = createTransport();
        const api = createAPI(transport);
        const controller = new AbortController();

        await api.create({ client_id: 'client' }, { signal: controller.signal });

        const request = transport.requests.at(-1)!;

        expect(request.signal).toBe(controller.signal);
        expect(Object.hasOwn(request, 'timeout')).toBe(false);
    });

    it('should time out with the timeout option', async () => {
        const transport = new MemoryTransport({ fetch: (request) => waitForAbort(request) });
        const api = createAPI(transport);

        let error : unknown;

        try {
            await api.create({ client_id: 'client' }, { timeout: 20 });
        } catch (e) {
            error = e;
        }

        expect(isClientErrorDueTimeout(error)).toBe(true);
    });

    it('should be exposed on the client and share its options', async () => {
        const transport = createTransport();
        const client = new OAuth2Client({ request: { transport } });

        expect(client.deviceAuthorization).toBeInstanceOf(DeviceAuthorizationAPI);

        client.options.deviceAuthorizationEndpoint = 'https://example.com/device_authorization';
        client.token.setOption('clientId', 'client');

        await client.deviceAuthorization.create();

        const request = transport.requests.at(-1)!;

        expect(request.url).toBe('https://example.com/device_authorization');
        expect(getBody(request).get('client_id')).toBe('client');
    });
});
