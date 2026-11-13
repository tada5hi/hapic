/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode } from '../../error/constants';
import { isObject } from '../../utils';
import type { RequestBaseOptions } from '../types';
import type { RequestAbort, RequestSignals } from './types';

/**
 * The largest delay a timer accepts without overflowing (2^31 - 1 ms,
 * about 24.8 days); Node clamps larger values to 1 ms.
 */
const REQUEST_TIMEOUT_MAX = 2_147_483_647;

export function isRequestTimeoutArmed(timeout: unknown) : timeout is number {
    return typeof timeout === 'number' &&
        Number.isFinite(timeout) &&
        timeout > 0;
}

/**
 * Turn an armed timeout into a delay AbortSignal.timeout() accepts:
 * a fraction is rounded up, a value above the timer limit is capped.
 */
function normalizeRequestTimeout(timeout: number) : number {
    return Math.min(Math.ceil(timeout), REQUEST_TIMEOUT_MAX);
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
        output.timeout = AbortSignal.timeout(normalizeRequestTimeout(options.timeout));
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
 * signal answers ETIMEDOUT; the caller signal answers ETIMEDOUT when its
 * reason is named TimeoutError (e.g. AbortSignal.timeout()) and
 * ECONNABORTED for any other reason. A non-Error reason is wrapped into an
 * AbortError carrying the reason as cause. A value that is no signal's reason is
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
        return {
            code: isTimeoutReason(input) ?
                ErrorCode.CONNECTION_TIMEOUT :
                ErrorCode.CONNECTION_ABORTED,
            error: toAbortError(input),
        };
    }

    return undefined;
}

/**
 * A caller signal aborted with a TimeoutError (e.g. AbortSignal.timeout())
 * is a timeout, not a cancellation.
 */
function isTimeoutReason(input: unknown) : boolean {
    return isObject(input) && input.name === 'TimeoutError';
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
