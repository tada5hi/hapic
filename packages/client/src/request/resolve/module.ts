/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { withBase, withQuery } from 'ufo';
import type { ResponseType } from '../../constants';
import { Headers } from '../../fetch';
import { HeaderStore } from '../../header';
import { traverse } from '../../utils';
import type { RequestOptions } from '../types';
import type { RequestResolveContext } from './types';

/**
 * Resolve the client defaults, the client headers and the per-request
 * options into the options the request pipeline (hooks, transformers,
 * transport) operates on.
 *
 * Merge rules:
 * - every option (incl. transform, responseTransform, params and query):
 *   a per-request value REPLACES the client default as a whole; an option
 *   is taken from the defaults only when the request does not set it.
 * - headers: LAYERED; per-request headers win, client default headers fill
 *   in the absent keys.
 * - url: resolved against the per-request baseURL, falling back to the
 *   client baseURL.
 * - params + query (both already resolved by the replace rule above): merged
 *   (query wins) into the url query string; bigint values become strings.
 */
export function resolveRequestOptions<RT extends `${ResponseType}` = `${ResponseType}`>(
    context: RequestResolveContext<RT>,
) : RequestOptions<RT> {
    const { defaults, config } = context;

    const headers = new Headers(config.headers);

    // headers: per-request values win, client default headers fill the gaps.
    new HeaderStore(headers).merge(context.headers, { overwrite: false });

    const baseURL = config.baseURL || defaults.baseURL;

    // all other options: a per-request value replaces the client default.
    const options : RequestOptions<RT> = {
        ...defaults,
        ...config,
        headers,
        url: baseURL ? withBase(config.url, baseURL) : config.url,
    };

    if (options.query || options.params) {
        options.url = withQuery(
            options.url,
            traverse({
                ...options.params,
                ...options.query,
            }, (value) => {
                if (typeof value === 'bigint') {
                    return value.toString();
                }

                return value;
            }),
        );
    }

    return options;
}
