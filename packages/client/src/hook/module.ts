/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ClientError } from '../error';
import { isPromise } from '../utils';
import { isRequestOptions } from '../request';
import type { RequestOptions } from '../request';
import { isResponse } from '../response';
import type { Response } from '../response';
import { HookName } from './constants';
import type {
    HookErrorFn,
    HookErrorRecovery,
    HookFn,
    HookReqFn,
} from './type';

export class HookManager {
    protected items : Record<string, (undefined | HookFn)[]>;

    constructor() {
        this.items = {};
    }

    addListener(name: `${HookName}`, fn: HookFn) : number {
        this.items[name] = this.items[name] || [];
        this.items[name].push(fn);

        return this.items[name].length - 1;
    }

    removeListener(name: `${HookName}`, fn: HookFn | number) {
        if (!this.items[name]) {
            return;
        }

        if (typeof fn === 'number') {
            this.items[name][fn] = undefined;
            return;
        }

        const index = this.items[name].indexOf(fn);
        if (index !== -1) {
            this.items[name][index] = undefined;
        }
    }

    removeListeners(name: `${HookName}`) {
        delete this.items[name];
    }

    async triggerReqHook(
        input: RequestOptions,
    ) : Promise<RequestOptions> {
        const items = (this.items[HookName.REQUEST] || []) as HookReqFn[];

        let temp = input;
        for (const hook of items) {
            if (!hook) {
                continue;
            }

            let output = hook(temp as any);
            if (isPromise(output)) {
                output = await output;
            }

            if (isRequestOptions(output)) {
                temp = output;
            }
        }

        return temp;
    }

    async triggerResHook(
        input: Response,
    ) : Promise<Response> {
        const items = (this.items[HookName.RESPONSE] || []) as HookReqFn[];

        let temp = input;
        for (const hook of items) {
            if (!hook) {
                continue;
            }

            let output = hook(temp as any);
            if (isPromise(output)) {
                output = await output;
            }

            if (isResponse(output)) {
                temp = output;
            }
        }

        return temp;
    }

    /**
     * Run the error hooks for a failed request and classify the outcome.
     *
     * Hooks run in registration order, each receiving the current error. A hook
     * recovers by returning a {@link Response} (short-circuit) or
     * {@link RequestOptions} (retry); the first such return wins and is returned
     * as a {@link HookErrorRecovery}. A hook that throws replaces the error
     * threaded into the remaining hooks. If no hook recovers, the (possibly
     * replaced) error is thrown — owning the whole recover-or-rethrow decision
     * here instead of splitting it across the request lifecycle.
     */
    async triggerErrorHook(
        name: `${HookName.RESPONSE_ERROR}` | `${HookName.REQUEST_ERROR}`,
        input: ClientError,
    ) : Promise<HookErrorRecovery> {
        const items = (this.items[name] || []) as HookErrorFn[];

        let temp = input;

        for (const hook of items) {
            if (!hook) {
                continue;
            }

            try {
                let output = hook(temp);
                if (isPromise(output)) {
                    output = await output;
                }

                if (isResponse(output)) {
                    return { type: 'response', response: output };
                }

                if (isRequestOptions(output)) {
                    return { type: 'retry', options: output };
                }
            } catch (e) {
                temp = e as ClientError;
            }
        }

        throw temp;
    }
}
