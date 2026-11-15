/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { scopeToString } from '../../utils';
import type { AuthorizeParameters } from './types';

/**
 * Typed parameters in the order they are written to the url.
 * Any other parameter is appended afterwards in input order.
 */
const PARAMETER_KEYS = [
    'response_type',
    'client_id',
    'redirect_uri',
    'response_mode',
    'scope',
    'state',
    'code_challenge',
    'code_challenge_method',
    'nonce',
    'display',
    'prompt',
    'max_age',
    'ui_locales',
    'id_token_hint',
    'login_hint',
    'acr_values',
];

/**
 * Credentials of the token request. The authorize URL is opened in the
 * browser (address bar, history, referrer, provider logs), so they are
 * never written to it, whatever the parameters object carries.
 */
const FORBIDDEN_PARAMETER_KEYS = [
    'client_secret',
    'client_assertion',
    'code_verifier',
    'password',
    'refresh_token',
];

function serializeParameterValue(value: unknown) : string | undefined {
    if (typeof value === 'number') {
        return String(value);
    }

    if (typeof value === 'string') {
        return value || undefined;
    }

    if (!Array.isArray(value)) {
        return undefined;
    }

    const isStringArray = value.every((item) => typeof item === 'string');

    return isStringArray ?
        scopeToString(value) || undefined :
        undefined;
}

export function buildAuthorizeURL(
    url: string,
    parameters: AuthorizeParameters,
) : string {
    const output = new URL(url);

    for (const key of PARAMETER_KEYS) {
        const value = serializeParameterValue(parameters[key]);

        if (typeof value !== 'undefined') {
            output.searchParams.set(key, value);
        } else if (key === 'response_type') {
            output.searchParams.set(key, 'code');
        }
    }

    const keys = Object.keys(parameters).filter((key) => !PARAMETER_KEYS.includes(key) &&
        !FORBIDDEN_PARAMETER_KEYS.includes(key));

    for (const key of keys) {
        // the space-delimited list is a convention of the typed parameters,
        // any other multi-valued parameter (e.g. resource, RFC 8707) is repeated.
        const input = parameters[key];
        const items = Array.isArray(input) ? input : [input];

        const values : string[] = [];

        for (const item of items) {
            const value = serializeParameterValue(item);

            if (typeof value !== 'undefined') {
                values.push(value);
            }
        }

        if (values.length === 0) {
            continue;
        }

        // a parameter must not occur more than once (RFC 6749 - 3.1):
        // the given value replaces one the endpoint already carries.
        output.searchParams.delete(key);

        for (const value of values) {
            output.searchParams.append(key, value);
        }
    }

    return output.href;
}
