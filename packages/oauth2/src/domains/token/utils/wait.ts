/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Resolve after `ms` milliseconds. Rejects with the signal's reason when the
 * signal aborts first, or at once when it is already aborted.
 * Internal: not re-exported from the package.
 */
export function wait(ms: number, signal?: AbortSignal) : Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal && signal.aborted) {
            reject(signal.reason);

            return;
        }

        let onAbort : (() => void) | undefined;

        const timer = setTimeout(() => {
            if (signal && onAbort) {
                signal.removeEventListener('abort', onAbort);
            }

            resolve();
        }, ms);

        if (!signal) {
            return;
        }

        onAbort = () => {
            clearTimeout(timer);
            reject(signal.reason);
        };

        signal.addEventListener('abort', onAbort, { once: true });
    });
}
