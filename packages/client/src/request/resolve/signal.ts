/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from '../types';

export function isRequestTimeoutArmed(timeout: unknown) : timeout is number {
    return typeof timeout === 'number' &&
        Number.isFinite(timeout) &&
        timeout > 0;
}

/**
 * Build the signal handed to the transport: the caller signal and, when
 * armed, a fresh timeout signal for this dispatch, combined so the first
 * to abort wins.
 */
export function resolveRequestSignal(
    options: Pick<RequestBaseOptions<any>, 'signal' | 'timeout'>,
) : AbortSignal | undefined {
    const signals : AbortSignal[] = [];

    if (options.signal) {
        signals.push(options.signal);
    }

    if (isRequestTimeoutArmed(options.timeout)) {
        signals.push(AbortSignal.timeout(options.timeout));
    }

    if (signals.length === 0) {
        return undefined;
    }

    if (signals.length === 1) {
        return signals[0];
    }

    return AbortSignal.any(signals);
}
