/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestOptions } from '../request';
import type { Response } from '../response';
import type { ErrorCode } from './constants';
import type { ClientError } from './module';

export type ClientErrorCreateContext<T = any> = {
    request: RequestOptions,
    error?: Error,
    response?: Response<T>,
    code?: ErrorCode,
};

export type ClientErrorContext<T = any> = ClientErrorCreateContext<T> & {
    message: string
};

/**
 * Reshape the error the client throws (e.g. strip credentials before it
 * reaches a logger). Receives the error after the error hooks.
 */
export type ErrorTransformer = (error: ClientError<any>) => Error;

export type ClientErrorCloneOptions = {
    /**
     * The request options of the clone.
     *
     * default: error.request
     */
    request?: RequestOptions,
    /**
     * The cause of the clone; undefined leaves it without one.
     *
     * default: error.cause
     */
    cause?: unknown,
};
