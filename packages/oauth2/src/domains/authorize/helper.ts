/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scopeToString } from '../../utils';
import type { AuthorizeParameters } from './types';

export function buildAuthorizeURL(
    url: string,
    parameters: AuthorizeParameters,
) : string {
    const output = new URL(url);

    if (parameters.response_type) {
        output.searchParams.set('response_type', parameters.response_type);
    } else {
        output.searchParams.set('response_type', 'code');
    }

    if (parameters.client_id) {
        output.searchParams.set('client_id', parameters.client_id);
    }

    if (parameters.redirect_uri) {
        output.searchParams.set('redirect_uri', parameters.redirect_uri);
    }

    if (parameters.response_mode) {
        output.searchParams.set('response_mode', parameters.response_mode);
    }

    if (parameters.scope) {
        const scope = Array.isArray(parameters.scope) ?
            scopeToString(parameters.scope) :
            parameters.scope;

        output.searchParams.set('scope', scope);
    }

    if (parameters.state) {
        output.searchParams.set('state', parameters.state);
    }

    if (parameters.code_challenge) {
        output.searchParams.set('code_challenge', parameters.code_challenge);
    }

    if (parameters.code_challenge_method) {
        output.searchParams.set('code_challenge_method', parameters.code_challenge_method);
    }

    return output.href;
}
