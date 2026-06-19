/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers } from '../fetch';
import type { HeaderContainer, HeaderMergeOptions } from './type';

function isHeadersInstance(input: unknown) : input is Headers {
    return typeof Headers !== 'undefined' &&
        input instanceof Headers;
}

/**
 * A uniform, case-insensitive view over any header container.
 *
 * Header values can arrive in three shapes — a `Headers` instance, an array of
 * `[key, value]` tuples, or a plain object. {@link HeaderStore} answers the
 * "what kind of container is this?" question once and exposes a single
 * get/set/unset/has/forEach/merge surface, so callers never branch on the
 * container shape themselves. All mutating operations act **in place** on the
 * wrapped container.
 */
export class HeaderStore {
    protected container : HeaderContainer;

    constructor(container: HeaderContainer = {}) {
        this.container = container;
    }

    /**
     * Whether a header is present (case-insensitive).
     */
    has(key: string) : boolean {
        return typeof this.get(key) !== 'undefined';
    }

    /**
     * Read a header value (case-insensitive), or `undefined` if absent.
     */
    get(key: string) : string | undefined {
        key = key.toLowerCase();

        const { container } = this;
        if (isHeadersInstance(container)) {
            const value = container.get(key);
            return value === null ? undefined : value;
        }

        if (Array.isArray(container)) {
            const tuple = container.find((el) => el.length === 2 && el[0].toLowerCase() === key);
            return tuple ? tuple[1] : undefined;
        }

        const objectKey = Object.keys(container).find((el) => el.toLowerCase() === key);
        return typeof objectKey === 'undefined' ?
            undefined :
            (container as Record<string, any>)[objectKey];
    }

    /**
     * Set a header value (case-insensitive); replaces an existing entry.
     */
    set(key: string, value: any) : this {
        key = key.toLowerCase();

        const { container } = this;
        if (isHeadersInstance(container)) {
            container.set(key, value);
            return this;
        }

        if (Array.isArray(container)) {
            const index = container.findIndex((el) => el.length === 2 && el[0].toLowerCase() === key);
            if (index === -1) {
                container.push([key, value]);
            } else {
                container[index] = [key, value];
            }
            return this;
        }

        const objectKey = Object.keys(container).find((el) => el.toLowerCase() === key);
        (container as Record<string, any>)[objectKey ?? key] = value;
        return this;
    }

    /**
     * Remove a header (case-insensitive); a no-op when absent.
     */
    unset(key: string) : this {
        key = key.toLowerCase();

        const { container } = this;
        if (isHeadersInstance(container)) {
            container.delete(key);
            return this;
        }

        if (Array.isArray(container)) {
            const index = container.findIndex((el) => el.length === 2 && el[0].toLowerCase() === key);
            if (index !== -1) {
                container.splice(index, 1);
            }
            return this;
        }

        const objectKey = Object.keys(container).find((el) => el.toLowerCase() === key);
        if (typeof objectKey !== 'undefined') {
            delete (container as Record<string, any>)[objectKey];
        }
        return this;
    }

    /**
     * Iterate every entry, regardless of the underlying container shape.
     */
    forEach(fn: (value: any, key: string) => void) : void {
        const { container } = this;
        if (isHeadersInstance(container)) {
            container.forEach(fn);
            return;
        }

        if (Array.isArray(container)) {
            for (const el of container) {
                if (el.length === 2) {
                    fn(el[1], el[0]);
                }
            }
            return;
        }

        const record = container as Record<string, any>;
        for (const key of Object.keys(record)) {
            fn(record[key], key);
        }
    }

    /**
     * Merge another container into this one (in place).
     *
     * By default existing keys are overwritten; pass `{ overwrite: false }` to
     * only fill in keys that are not already present.
     */
    merge(source: HeaderContainer, options: HeaderMergeOptions = {}) : this {
        const overwrite = options.overwrite ?? true;

        new HeaderStore(source).forEach((value, key) => {
            if (overwrite || !this.has(key)) {
                this.set(key, value);
            }
        });

        return this;
    }
}
