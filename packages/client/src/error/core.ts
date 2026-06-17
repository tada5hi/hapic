/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// Re-export the @ebec/core primitives that build hapic's error layer, so service
// packages consume them through `hapic` instead of depending on @ebec/core directly.
export {
    BaseError,
    isBaseError,
    type ErrorInput,
    type ErrorOptions,
    type IBaseError,
} from '@ebec/core';
