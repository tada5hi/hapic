/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectRepositoryNameParsed } from './type';

export function parseProjectRepositoryName(name: string) : ProjectRepositoryNameParsed {
    const index = name.indexOf('/');
    if (index === -1) {
        throw new Error('The project repository name could not parsed.');
    }

    const projectName = name.substring(0, index);
    const repositoryName = name.substring(projectName.length + 1);

    return {
        projectName,
        repositoryName,
    };
}
