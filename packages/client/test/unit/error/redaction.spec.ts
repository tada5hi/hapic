/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { inspect } from 'node:util';
import {
    Client,
    ErrorCode,
    HookName,
    HttpResponseError,
    MemoryTransport,
    NetworkError,
    isClientError,
    isClientErrorDueNetworkIssue,
    isClientErrorWithStatusCode,
    isHapicError,
    isHttpResponseError,
    isNetworkError,
} from '../../../src';
import type { ClientError, ClientOptionsInput } from '../../../src';

const TOKEN = 'secret-token-123';
const QUERY = 'q=private-query';

function createResponse(status: number, statusText: string, body: unknown, url: string) {
    const response = new Response(JSON.stringify(body), {
        status,
        statusText,
        headers: { 'content-type': 'application/json' },
    });

    // a real fetch response carries the final url
    Object.defineProperty(response, 'url', { value: url, configurable: true });

    return response;
}

function createNotFoundClient(options: ClientOptionsInput = {}) {
    const transport = new MemoryTransport({ fetch: (request) => createResponse(404, 'Not Found', { message: 'missing' }, request.url) });

    const client = new Client({
        baseURL: 'https://auth.example/', 
        transport, 
        ...options, 
    });

    client.setAuthorizationHeader({ type: 'Bearer', token: TOKEN });

    return { client, transport };
}

function createFailingClient(options: ClientOptionsInput = {}) {
    const transport = new MemoryTransport({
        fetch: (request) => {
            throw new TypeError(`fetch failed for ${request.url}`);
        },
    });

    const client = new Client({
        baseURL: 'https://auth.example/', 
        transport, 
        ...options, 
    });

    client.setAuthorizationHeader({ type: 'Bearer', token: TOKEN });

    return { client, transport };
}

async function catchError(promise: Promise<unknown>) : Promise<ClientError> {
    try {
        await promise;
    } catch (e) {
        return e as ClientError;
    }

    throw new Error('expected the request to fail');
}

function expectNoLeak(error: ClientError) {
    const surfaces = [
        JSON.stringify(error),
        error.message,
        error.stack || '',
        JSON.stringify(error.request),
        inspect(error, { depth: 5 }),
    ];

    for (const surface of surfaces) {
        expect(surface).not.toContain(TOKEN);
        expect(surface).not.toContain(QUERY);
        expect(surface).not.toContain('auth.example');
    }
}

describe('src/error/redaction', () => {
    it('should keep an unread stream body on the reduced response', async () => {
        const { client } = createNotFoundClient({ errors: { request: false, cause: false } });

        let error : ClientError | undefined;

        try {
            await client.get(`roles/1?${QUERY}`, { responseType: 'stream' });
        } catch (e) {
            error = e as ClientError;
        }

        expect(error!.response!.url).toBe('');
        expect(await new Response(error!.response!.body).json()).toEqual({ message: 'missing' });
    });

    it('should leave the error the hook saw untouched', async () => {
        const { client } = createNotFoundClient({ errors: { request: false, cause: false } });
        let seen : ClientError | undefined;

        client.on(HookName.RESPONSE_ERROR, (err) => {
            seen = err;

            throw err;
        });

        let error : ClientError | undefined;

        try {
            await client.get(`roles/1?${QUERY}`);
        } catch (e) {
            error = e as ClientError;
        }

        expect(error).toBeDefined();
        expect(error!.response!.url).toBe('');
        expect(error!.response!.status).toBe(404);
        expect(error!.response!.data).toEqual({ message: 'missing' });
        expect(seen!.response!.url).toContain(QUERY);
        expect(seen!.request.url).toContain(QUERY);
    });

    describe('default', () => {
        it('should keep the request and the url in the message', async () => {
            const { client } = createNotFoundClient();

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expect(error.message).toContain('https://auth.example/roles/1');
            expect(error.request.url).toContain(QUERY);
        });
    });

    describe('errors.request = false', () => {
        it('should throw an http response error without the request', async () => {
            const { client } = createNotFoundClient({ errors: { request: false } });

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expectNoLeak(error);

            expect(error).toBeInstanceOf(HttpResponseError);
            expect(isHttpResponseError(error)).toBe(true);
            expect(isClientError(error)).toBe(true);
            expect(isHapicError(error)).toBe(true);
            expect(isClientErrorWithStatusCode(error, 404)).toBe(true);

            expect(error.message).toBe('404 Not Found');
            expect(error.stack!.split('\n')[0]).toBe('HttpResponseError: 404 Not Found');
            expect(error.request).toEqual({ method: 'GET', url: '' });
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
            expect(error.response!.status).toBe(404);
            expect(error.response!.data).toEqual({ message: 'missing' });
            expect(error.response!.headers.get('content-type')).toBe('application/json');
        });

        it('should keep the cause unless disabled', async () => {
            const { client } = createFailingClient({ errors: { request: false } });

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expect(error.cause).toBeInstanceOf(TypeError);
        });

        it('should throw a network error without the request', async () => {
            const { client } = createFailingClient({ errors: { request: false, cause: false } });

            const error = await catchError(client.post(`roles?${QUERY}`, { a: 1 }));

            expectNoLeak(error);

            expect(error).toBeInstanceOf(NetworkError);
            expect(isNetworkError(error)).toBe(true);
            expect(isClientErrorDueNetworkIssue(error)).toBe(true);
            expect(error.code).toBe(ErrorCode.CONNECTION_CLOSED);
            expect(error.message).toBe(ErrorCode.CONNECTION_CLOSED);
            expect(error.request).toEqual({ method: 'POST', url: '' });
            expect(error.response).toBeUndefined();
            expect(error.cause).toBeUndefined();
        });

        it('should apply a per-request option', async () => {
            const { client } = createNotFoundClient();

            const error = await catchError(client.get(`roles/1?${QUERY}`, { errors: { request: false, cause: false } }));

            expectNoLeak(error);
        });

        it('should let a per-request option re-enable the details', async () => {
            const { client } = createNotFoundClient({ errors: { request: false } });

            const error = await catchError(client.get(`roles/1?${QUERY}`, { errors: { request: true } }));

            expect(error.request.url).toContain(QUERY);
        });

        it('should hand the full error to the error hook', async () => {
            const { client } = createNotFoundClient({ errors: { request: false, cause: false } });

            let seen : ClientError | undefined;

            client.on(HookName.RESPONSE_ERROR, (e) => {
                seen = e;

                throw e;
            });

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expect(seen).toBeDefined();
            expect(seen!.request.url).toContain(QUERY);
            expect((seen!.request.headers as Headers).get('authorization')).toContain(TOKEN);
            expect(error).not.toBe(seen);
            expectNoLeak(error);
        });

        it('should still retry through the error hook', async () => {
            let calls = 0;
            const transport = new MemoryTransport({
                fetch: (request) => {
                    calls++;

                    if (calls === 1) {
                        return createResponse(401, 'Unauthorized', {}, request.url);
                    }

                    return { status: 200, body: { ok: true } };
                },
            });

            const client = new Client({
                baseURL: 'https://auth.example/',
                transport,
                errors: { request: false, cause: false },
            });

            client.on(HookName.RESPONSE_ERROR, (e) => ({
                ...e.request,
                headers: { authorization: 'Bearer fresh' },
            }));

            const response = await client.get(`roles/1?${QUERY}`);

            expect(response.data).toEqual({ ok: true });
            expect(calls).toBe(2);
            expect(transport.requests[1].url).toContain(QUERY);
        });

        it('should redact the error a failed retry throws', async () => {
            const { client } = createNotFoundClient({ errors: { request: false, cause: false } });

            let retried = false;

            client.on(HookName.RESPONSE_ERROR, (e) => {
                if (retried) {
                    throw e;
                }

                retried = true;

                return e.request;
            });

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expect(retried).toBe(true);
            expectNoLeak(error);
        });
    });

    describe('errors.cause = false', () => {
        it('should drop the cause and keep the request', async () => {
            const { client } = createFailingClient({ errors: { cause: false } });

            const error = await catchError(client.get(`roles/1?${QUERY}`));

            expect(isNetworkError(error)).toBe(true);
            expect(error.cause).toBeUndefined();
            expect(JSON.stringify(error)).not.toContain('"cause"');
            expect(error.request.url).toContain(QUERY);
        });
    });
});
