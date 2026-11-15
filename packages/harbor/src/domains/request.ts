/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IClient, RequestBaseOptions } from 'hapic';
import { HeaderName } from '../constants';
import { buildQueryString, extractResourceMetaOfResponse } from '../utils';
import type { ResourceCollectionQuery, ResourceCollectionResponse } from './types';

/*
 * Harbor wire conventions shared by every domain API.
 * Internal: not re-exported from the package barrel.
 */

type PathSegment = string | number;

/**
 * Build a request path from its segments, each URL-encoded once,
 * followed by the serialized query.
 */
export function buildRequestPath(
    segments: PathSegment[],
    query?: Record<string, any>,
) : string {
    const path = segments
        .map((segment) => encodeURIComponent(segment))
        .join('/');

    return `${path}${buildQueryString(query)}`;
}

/**
 * Build a path below `projects/{project_name}/repositories/{repository_name}`.
 *
 * The repository name is URL-encoded twice (`a/b` -> `a%252Fb`):
 * Harbor unescapes it once more after routing (`unescapePathParams`).
 */
export function buildRepositoryPath(
    projectName: string,
    repositoryName: string,
    segments: PathSegment[] = [],
    query?: Record<string, any>,
) : string {
    return buildRequestPath(
        ['projects', projectName, 'repositories', encodeURIComponent(repositoryName), ...segments],
        query,
    );
}

/**
 * Make a `q` value match exactly.
 *
 * Harbor reads a value starting with `~` as a substring match and one
 * starting with `[`, `{` or `(` as a range or list; a leading `\` is
 * stripped and the rest is matched exactly (lib/q/builder.go
 * `parsePattern`, `escapeValue`). So every value gets a leading `\`,
 * which also keeps a value that itself starts with `\` intact.
 */
export function exactMatch(value: string) : string {
    return `\\${value}`;
}

/**
 * Request options telling Harbor to read a `{project_name_or_id}`
 * path parameter as a name (`X-Is-Resource-Name`).
 */
export function withResourceName(isResourceName?: boolean) : RequestBaseOptions {
    const headers: Record<string, any> = {};

    if (isResourceName) {
        headers[HeaderName.IS_RESOURCE_NAME] = true;
    }

    return { headers };
}

/**
 * Fetch a collection and attach the `X-Total-Count` meta.
 */
export async function getCollection<T>(
    client: IClient,
    url: string,
    options?: RequestBaseOptions,
) : Promise<ResourceCollectionResponse<T>> {
    const response = await client.get(url, options);

    return {
        data: response.data,
        meta: extractResourceMetaOfResponse(response),
    };
}

/**
 * Fetch every page of a collection, page by page,
 * until a page returns fewer items than requested.
 * The input query is not modified.
 */
export async function getAllPages<T, Q extends ResourceCollectionQuery>(
    input: Q | undefined,
    getPage: (query: Q) => Promise<ResourceCollectionResponse<T>>,
) : Promise<ResourceCollectionResponse<T>> {
    const pageSize = input?.page_size || 50;
    let page = input?.page || 1;

    const output = await getPage({
        ...input,
        page_size: pageSize,
        page,
    } as Q);

    let { length } = output.data;

    while (length === pageSize) {
        page++;

        const next = await getPage({
            ...input,
            page_size: pageSize,
            page,
        } as Q);

        output.data.push(...next.data);
        length = next.data.length;
    }

    return output;
}
