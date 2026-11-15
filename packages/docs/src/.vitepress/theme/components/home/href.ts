/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { withBase } from 'vitepress';

/**
 * Resolve a frontmatter link for an `href`: internal paths get the site
 * base, absolute URLs (and mailto/tel links) are returned unchanged.
 */
export function toHref(link: string): string {
    return /^[a-z][a-z\d+.-]*:/i.test(link) ? link : withBase(link);
}
