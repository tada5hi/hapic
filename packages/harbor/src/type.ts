/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project, SearchRepository } from './domains';

export type SearchResult = {
    project: Project[],
    repository: SearchRepository[]
};
