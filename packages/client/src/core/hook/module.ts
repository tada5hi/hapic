/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { isPromise } from '../../utils';
import type { ClientContext } from '../context';
import type { HookName } from './constants';
import type {
    HookFn, HookOptions,
} from './type';

export class HookManager {
    protected items : Record<string, (undefined | HookFn)[]>;

    protected options : Record<string, HookOptions>;

    constructor() {
        this.items = {};
        this.options = {};
    }

    setOptions(name: `${HookName}`, options: HookOptions) {
        this.options[name] = options;
    }

    hook(name: `${HookName}`, fn: HookFn) : number {
        this.items[name] = this.items[name] || [];
        this.items[name].push(fn);

        return this.items[name].length - 1;
    }

    removeHook(name: `${HookName}`, fn: HookFn | number) {
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

    removeHooks(name: `${HookName}`) {
        delete this.items[name];
        delete this.options[name];
    }

    async callHook<T = any>(name: `${HookName}`, input: T) : Promise<T> {
        const options = this.options[name];
        const items = this.items[name] || [];

        let temp = input;
        let error : unknown | undefined;

        for (let i = 0; i < items.length; i++) {
            const hook = items[i];
            if (!hook) {
                continue;
            }

            try {
                let output = hook(input);
                if (isPromise(output)) {
                    output = await (output as Promise<ClientContext>);
                }

                if (output) {
                    if (options.returnOnResponse) {
                        return output;
                    }

                    temp = output;
                }
            } catch (e) {
                if (options.continueOnError) {
                    error = e;
                } else {
                    throw e;
                }
            }
        }

        if (error) {
            throw error;
        }

        return temp;
    }
}
