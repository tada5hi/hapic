/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type {
    RequestBaseOptions,
    Response,
    ResponseData,
    ClientError,
    ErrorCode,
} from 'hapic';

export { isClientErrorDueNetworkIssue } from 'hapic';
export { isClientErrorWithStatusCode } from 'hapic';
export { isClientError } from 'hapic';
