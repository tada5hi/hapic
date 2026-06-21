/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * The current environment's global object.
 *
 * Resolves the global across Node.js, browsers and workers by probing - in order -
 * `globalThis`, `self`, `window` and `global`; the first one defined wins.
 *
 * Used to read the platform `fetch`/`Headers`/`Blob`/... implementations (see
 * `fetch.ts`) and as the receiver when invoking the branded WHATWG `fetch`: the
 * spec requires `this` to be the global object, so `FetchTransport` binds `fetch`
 * to this value (otherwise browsers throw `Illegal invocation`).
 *
 * @throws if no global object can be located.
 */
const globalContext = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }

    if (typeof self !== 'undefined') {
        return self;
    }

    if (typeof window !== 'undefined') {
        return window;
    }

    if (typeof global !== 'undefined') {
        return global;
    }

    throw new Error('unable to locate global object');
})();

export {
    globalContext,
};
