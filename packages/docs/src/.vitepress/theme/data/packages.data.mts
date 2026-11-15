/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createContentLoader } from 'vitepress';
import { buildPackageCard } from './packages';
import type { PackageCard } from './packages';

declare const data: PackageCard[];
export { data };

// `.mts`, not `.ts`: VitePress bundles loaders with esbuild in the format of the
// nearest package.json, which is CommonJS here, and `vitepress` is ESM only.
// The glob is relative to the VitePress source root (packages/docs/src).
export default createContentLoader('packages/*.md', {
    transform(pages): PackageCard[] {
        return pages
            .filter((page) => !page.url.endsWith('/'))
            .map((page) => buildPackageCard(page.url, page.frontmatter))
            .sort((a, b) => a.order - b.order);
    },
});
