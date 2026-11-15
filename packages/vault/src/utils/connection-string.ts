/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConnectionStringParseError, splitConnectionString } from 'hapic';
import type { ConnectionOptions } from '../config/types';

const NAMESPACE_PARAMETER = 'namespace';

function decodeQueryComponent(input: string) : string {
    try {
        return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch {
        throw new ConnectionStringParseError(`Vault connection string has a malformed query parameter: ${input}`);
    }
}

/**
 * Remove the namespace query parameter from the host
 * and return it decoded. Other query parameters are kept as given.
 */
function extractNamespace(input: string) : { host: string, namespace?: string } {
    const hashIndex = input.indexOf('#');
    const hash = hashIndex === -1 ? '' : input.substring(hashIndex);
    const url = hashIndex === -1 ? input : input.substring(0, hashIndex);

    const queryIndex = url.indexOf('?');

    if (queryIndex === -1) {
        return { host: input };
    }

    const base = url.substring(0, queryIndex);
    const parameters = url.substring(queryIndex + 1).split('&');

    let namespace : string | undefined;
    const rest : string[] = [];

    for (const parameter of parameters) {
        const separatorIndex = parameter.indexOf('=');
        const key = separatorIndex === -1 ? parameter : parameter.substring(0, separatorIndex);

        if (decodeQueryComponent(key) === NAMESPACE_PARAMETER) {
            namespace = separatorIndex === -1 ?
                '' :
                decodeQueryComponent(parameter.substring(separatorIndex + 1));
        } else if (parameter.length > 0) {
            rest.push(parameter);
        }
    }

    if (typeof namespace === 'undefined') {
        return { host: input };
    }

    return {
        host: (rest.length > 0 ? `${base}?${rest.join('&')}` : base) + hash,
        namespace,
    };
}

/**
 * Parse a connection string in the format token@host.
 *
 * A namespace can be passed as query parameter of the host,
 * e.g. token@https://vault:8200/v1/?namespace=team-a
 */
export function parseConnectionString(connectionString: string): ConnectionOptions {
    const { credentials, host } = splitConnectionString(connectionString, { message: 'Vault connection string must be in the following format: token@host' });

    const extracted = extractNamespace(host);

    const output : ConnectionOptions = {
        host: extracted.host,
        token: credentials,
    };

    if (extracted.namespace) {
        output.namespace = extracted.namespace;
    }

    return output;
}
