/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasInstanceof } from '@ebec/core';

export {
    INSTANCEOF_PROPERTY,
    hasInstanceof,
    markInstanceof,
} from '@ebec/core';

/**
 * Check if an instance carries the cross-realm marker registered under `name`.
 *
 * @deprecated prefer `hasInstanceof(input, Symbol.for(name))` from `@ebec/core`.
 * Retained as a thin, backward-compatible wrapper that resolves `name` to its
 * global `Symbol.for(...)` marker and looks it up in the instance's
 * `@instanceof` marker chain.
 */
export function verifyInstanceBySymbol(
    input: unknown,
    name: string,
) {
    return hasInstanceof(input, Symbol.for(name));
}
