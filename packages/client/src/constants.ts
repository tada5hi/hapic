/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ResponseType {
    BLOB = 'blob',
    STREAM = 'stream',
    TEXT = 'text',
    ARRAY_BUFFER = 'arrayBuffer',
    JSON = 'json',
}

export enum MethodName {
    DELETE = 'DELETE',
    GET = 'GET',
    HEAD = 'HEAD',
    PATCH = 'PATCH',
    POST = 'POST',
    PUT = 'PUT',
}
