/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RepositoryNameParsed } from './type';

export function parseProjectRepositoryName(name: string) : RepositoryNameParsed {
    const parts = name.split('/');
    const projectName = parts.shift();
    const repositoryName = parts.join('/');

    return {
        project_name: projectName,
        repository_name: repositoryName,
    };
}
