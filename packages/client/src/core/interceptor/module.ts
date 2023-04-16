/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { isPromise } from '../../utils';
import { isClientContextWithError } from '../context';
import type { ClientContext } from '../context';
import type { InterceptorErrorHandler, InterceptorHandler } from './type';

export class InterceptorManager {
    protected handlers : (InterceptorHandler | undefined)[];

    protected errorHandlers : (InterceptorErrorHandler | undefined)[];

    constructor() {
        this.handlers = [];
        this.errorHandlers = [];
    }

    registerHandler(interceptor: InterceptorHandler) {
        this.handlers.push(interceptor);

        return this.handlers.length - 1;
    }

    ejectHandler(index: number) {
        if (this.handlers[index]) {
            this.handlers[index] = undefined;
        }
    }

    clearHandlers() {
        this.handlers = [];
    }

    registerErrorHandler(interceptor: InterceptorErrorHandler) {
        this.errorHandlers.push(interceptor);

        return this.errorHandlers.length - 1;
    }

    ejectErrorHandler(index: number) {
        if (this.errorHandlers[index]) {
            this.errorHandlers[index] = undefined;
        }
    }

    clearErrorHandlers() {
        this.errorHandlers = [];
    }

    async run(ctx: ClientContext) : Promise<ClientContext | undefined> {
        if (isClientContextWithError(ctx)) {
            const isLast = (i: number) => i === this.handlers.length;

            for (let i = 0; i < this.errorHandlers.length; i++) {
                const interceptor = this.errorHandlers[i];
                if (!interceptor) {
                    if (isLast(i)) {
                        throw ctx.error;
                    }

                    continue;
                }

                try {
                    let output = interceptor(ctx);
                    if (isPromise(output)) {
                        output = await output;
                    }

                    if (output) {
                        return output;
                    }
                } catch (e) {
                    if (isLast(i)) {
                        throw e;
                    }
                }
            }

            return undefined;
        }

        for (let i = 0; i < this.handlers.length; i++) {
            const interceptor = this.handlers[i];
            if (!interceptor) {
                continue;
            }

            const output = interceptor(ctx);
            if (output) {
                if (isPromise(output)) {
                    ctx = await (output as Promise<ClientContext>);
                } else {
                    ctx = output;
                }
            }
        }

        return ctx;
    }
}
