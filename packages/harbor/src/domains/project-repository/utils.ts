/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectRepositoryLongNameRepresentation } from './type';

export function parseLongProjectRepositoryName(name: string) : ProjectRepositoryLongNameRepresentation {
    const index = name.indexOf('/');
    if (index === -1) {
        throw new Error('The project repository name could not parsed.');
    }

    const projectName = name.substring(0, index);
    let repositoryName = name.substring(projectName.length + 1);

    let artifactDigest : string | undefined;
    if (repositoryName.indexOf('@') !== -1) {
        const index = repositoryName.indexOf('@');
        artifactDigest = repositoryName.substring(index + 1);
        repositoryName = repositoryName.substring(0, index);
    }

    let artifactTag : string | undefined;
    if (repositoryName.indexOf(':') !== -1) {
        const index = repositoryName.indexOf(':');
        artifactTag = repositoryName.substring(index + 1);
        repositoryName = repositoryName.substring(0, index);
    }

    return {
        projectName,
        repositoryName,
        ...(artifactDigest ? { artifactDigest } : {}),
        ...(artifactTag ? { artifactTag } : {}),
    };
}

export function buildProjectRepositoryLongName(
    representation: ProjectRepositoryLongNameRepresentation,
) : string {
    const str = `${representation.projectName}/${representation.repositoryName}`;

    if (representation.artifactTag) {
        return `${str}:${representation.artifactTag}`;
    }
    if (representation.artifactDigest) {
        return `${str}@${representation.artifactDigest}`;
    }

    return str;
}
