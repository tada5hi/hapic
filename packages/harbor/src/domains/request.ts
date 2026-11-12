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
 * Build a request path from its segments, followed by the serialized query.
 */
export function buildRequestPath(
    segments: PathSegment[],
    query?: Record<string, any>,
) : string {
    return `${segments.join('/')}${buildQueryString(query)}`;
}

/**
 * Build a path below `projects/{project_name}/repositories/{repository_name}`.
 */
export function buildRepositoryPath(
    projectName: string,
    repositoryName: string,
    segments: PathSegment[] = [],
    query?: Record<string, any>,
) : string {
    return buildRequestPath(
        ['projects', projectName, 'repositories', repositoryName, ...segments],
        query,
    );
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
 */
export async function getAllPages<T, Q extends ResourceCollectionQuery>(
    query: Q,
    getPage: (query: Q) => Promise<ResourceCollectionResponse<T>>,
) : Promise<ResourceCollectionResponse<T>> {
    if (!query.page_size) {
        query.page_size = 50;
    }

    if (!query.page) {
        query.page = 1;
    }

    const output = await getPage(query);

    let { length } = output.data;

    while (length === query.page_size) {
        query.page++;

        const next = await getPage(query);

        output.data.push(...next.data);
        length = next.data.length;
    }

    return output;
}
