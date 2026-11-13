/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode } from '../../error/constants';
import type { RequestBaseOptions } from '../types';
import type { RequestAbort, RequestSignals } from './types';

export function isRequestTimeoutArmed(timeout: unknown) : timeout is number {
    return typeof timeout === 'number' &&
        Number.isFinite(timeout) &&
        timeout > 0;
}

/**
 * Build the signals of one dispatch: the caller signal, a fresh timeout
 * signal when armed, and the signal handed to the transport (both
 * combined, so the first to abort wins).
 */
export function resolveRequestSignals(
    options: Pick<RequestBaseOptions<any>, 'signal' | 'timeout'>,
) : RequestSignals {
    const output : RequestSignals = {};

    if (options.signal) {
        output.caller = options.signal;
    }

    if (isRequestTimeoutArmed(options.timeout)) {
        output.timeout = AbortSignal.timeout(options.timeout);
    }

    if (output.caller && output.timeout) {
        output.signal = AbortSignal.any([output.caller, output.timeout]);
    } else {
        output.signal = output.caller || output.timeout;
    }

    return output;
}

/**
 * Classify a thrown value by the signal it is the reason of. The timeout
 * signal answers ETIMEDOUT, the caller signal ECONNABORTED whatever its
 * reason looks like; a non-Error reason is wrapped into an AbortError
 * carrying the reason as cause. A value that is no signal's reason is
 * left to the name-based classification.
 */
export function resolveRequestAbort(
    input: unknown,
    signals: RequestSignals,
) : RequestAbort | undefined {
    if (
        signals.timeout &&
        signals.timeout.aborted &&
        signals.timeout.reason === input
    ) {
        return { code: ErrorCode.CONNECTION_TIMEOUT, error: toAbortError(input) };
    }

    if (
        signals.caller &&
        signals.caller.aborted &&
        signals.caller.reason === input
    ) {
        return { code: ErrorCode.CONNECTION_ABORTED, error: toAbortError(input) };
    }

    return undefined;
}

function toAbortError(input: unknown) : Error {
    // eslint-disable-next-line unicorn/prefer-error-is-error -- Keep compatibility with the published Node.js runtime requirement.
    if (input instanceof Error) {
        return input;
    }

    const error = new Error(
        typeof input === 'undefined' ? 'The operation was aborted.' : String(input),
        { cause: input },
    );

    error.name = 'AbortError';

    return error;
}
