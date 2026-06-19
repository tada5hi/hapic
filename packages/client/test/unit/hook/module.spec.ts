/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HookManager,
    HookName,
    createClientError,
} from '../../../src';

const makeError = () => createClientError({ request: { url: '/x', method: 'GET' } as any });
const makeResponse = (extra: Record<string, any> = {}) => ({
    headers: {}, 
    ok: true, 
    ...extra, 
}) as any;
const makeOptions = (extra: Record<string, any> = {}) => ({
    url: '/retry', 
    method: 'GET', 
    ...extra, 
}) as any;

describe('src/hook', () => {
    describe('storage', () => {
        it('should return an incrementing id per registration', () => {
            const manager = new HookManager();

            expect(manager.addListener(HookName.REQUEST, (o) => o)).toBe(0);
            expect(manager.addListener(HookName.REQUEST, (o) => o)).toBe(1);
            expect(manager.addListener(HookName.REQUEST, (o) => o)).toBe(2);
        });

        it('should remove a listener by id', async () => {
            const manager = new HookManager();
            let called = false;

            const id = manager.addListener(HookName.REQUEST, (o) => {
                called = true;
                return o;
            });
            manager.removeListener(HookName.REQUEST, id);

            await manager.triggerReqHook(makeOptions());
            expect(called).toBe(false);
        });

        it('should remove a listener by function reference', async () => {
            const manager = new HookManager();
            let called = false;
            const fn = (o: any) => {
                called = true;
                return o;
            };

            manager.addListener(HookName.REQUEST, fn);
            manager.removeListener(HookName.REQUEST, fn);

            await manager.triggerReqHook(makeOptions());
            expect(called).toBe(false);
        });

        it('should remove all listeners for a name', async () => {
            const manager = new HookManager();
            let count = 0;
            manager.addListener(HookName.REQUEST, (o) => { count++; return o; });
            manager.addListener(HookName.REQUEST, (o) => { count++; return o; });

            manager.removeListeners(HookName.REQUEST);

            await manager.triggerReqHook(makeOptions());
            expect(count).toBe(0);
        });

        it('should be a no-op when removing from an unknown name', () => {
            const manager = new HookManager();
            expect(() => manager.removeListener(HookName.REQUEST, 0)).not.toThrow();
        });
    });

    describe('triggerReqHook', () => {
        it('should run hooks in order and thread the result', async () => {
            const manager = new HookManager();
            const order: string[] = [];

            manager.addListener(HookName.REQUEST, (o) => {
                order.push('a');
                return makeOptions({ url: o.url, step: 'a' });
            });
            manager.addListener(HookName.REQUEST, async (o) => {
                order.push('b');
                return makeOptions({ url: o.url, step: `${o.step}b` });
            });

            const result = await manager.triggerReqHook(makeOptions({ url: '/start' }));

            expect(order).toEqual(['a', 'b']);
            expect((result as any).step).toBe('ab');
        });

        it('should keep the previous value when a hook returns a non-request', async () => {
            const manager = new HookManager();
            const initial = makeOptions({ url: '/keep' });

            manager.addListener(HookName.REQUEST, () => undefined as any);

            const result = await manager.triggerReqHook(initial);
            expect(result).toBe(initial);
        });

        it('should skip a removed hook but run the rest', async () => {
            const manager = new HookManager();
            const order: string[] = [];

            const id = manager.addListener(HookName.REQUEST, (o) => { order.push('a'); return o; });
            manager.addListener(HookName.REQUEST, (o) => { order.push('b'); return o; });
            manager.removeListener(HookName.REQUEST, id);

            await manager.triggerReqHook(makeOptions());
            expect(order).toEqual(['b']);
        });
    });

    describe('triggerResHook', () => {
        it('should run hooks in order and thread the response', async () => {
            const manager = new HookManager();

            manager.addListener(HookName.RESPONSE, (r: any) => makeResponse({ stage: `${r.stage ?? ''}a` }));
            manager.addListener(HookName.RESPONSE, async (r: any) => makeResponse({ stage: `${r.stage}b` }));

            const result = await manager.triggerResHook(makeResponse());
            expect((result as any).stage).toBe('ab');
        });

        it('should keep the previous response when a hook returns a non-response', async () => {
            const manager = new HookManager();
            const initial = makeResponse({ marker: 'keep' });

            manager.addListener(HookName.RESPONSE, () => undefined as any);

            const result = await manager.triggerResHook(initial);
            expect(result).toBe(initial);
        });
    });

    describe('triggerErrorHook', () => {
        it('should classify a returned response as a short-circuit recovery', async () => {
            const manager = new HookManager();
            const response = makeResponse({ recovered: true });
            manager.addListener(HookName.RESPONSE_ERROR, () => response);

            const recovery = await manager.triggerErrorHook(HookName.RESPONSE_ERROR, makeError());

            expect(recovery).toEqual({ type: 'response', response });
        });

        it('should classify returned request options as a retry recovery', async () => {
            const manager = new HookManager();
            const options = makeOptions({ url: '/again' });
            manager.addListener(HookName.RESPONSE_ERROR, () => options);

            const recovery = await manager.triggerErrorHook(HookName.RESPONSE_ERROR, makeError());

            expect(recovery).toEqual({ type: 'retry', options });
        });

        it('should let the first recovering hook win', async () => {
            const manager = new HookManager();
            const response = makeResponse({ first: true });
            let secondCalled = false;

            manager.addListener(HookName.RESPONSE_ERROR, () => response);
            manager.addListener(HookName.RESPONSE_ERROR, () => {
                secondCalled = true;
                return makeResponse({ second: true });
            });

            const recovery = await manager.triggerErrorHook(HookName.RESPONSE_ERROR, makeError());

            expect((recovery as any).response).toBe(response);
            expect(secondCalled).toBe(false);
        });

        it('should rethrow the original error when no hook recovers', async () => {
            const manager = new HookManager();
            const error = makeError();

            await expect(manager.triggerErrorHook(HookName.RESPONSE_ERROR, error))
                .rejects.toBe(error);
        });

        it('should thread a thrown error into later hooks and rethrow it', async () => {
            const manager = new HookManager();
            const replacement = new Error('replaced');
            let seen: unknown;

            manager.addListener(HookName.RESPONSE_ERROR, () => { throw replacement; });
            manager.addListener(HookName.RESPONSE_ERROR, (e) => {
                seen = e;
                throw e;
            });

            await expect(manager.triggerErrorHook(HookName.RESPONSE_ERROR, makeError()))
                .rejects.toBe(replacement);
            expect(seen).toBe(replacement);
        });

        it('should recover after an earlier hook threw', async () => {
            const manager = new HookManager();
            const options = makeOptions({ url: '/after-throw' });

            manager.addListener(HookName.RESPONSE_ERROR, () => { throw new Error('boom'); });
            manager.addListener(HookName.RESPONSE_ERROR, () => options);

            const recovery = await manager.triggerErrorHook(HookName.RESPONSE_ERROR, makeError());
            expect(recovery).toEqual({ type: 'retry', options });
        });
    });
});
