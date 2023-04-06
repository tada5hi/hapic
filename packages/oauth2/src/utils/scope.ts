/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function scopeToArray(scope: string[] | string) : string[] {
    return Array.isArray(scope) ?
        scope :
        scope.split(' ');
}

export function scopeToString(scope: string[] | string) : string {
    if (typeof scope === 'string') {
        return scope;
    }

    return [
        ...new Set(scope),
    ].join(' ');
}
