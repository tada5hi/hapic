/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ProjectRepository = {
    id: number,
    //
    /**
     * Full repository name
     * <project-name>/<repository-name>
     */
    name: string,
    project_id: number,
    pull_count: number,
    artifact_count: number,
    description?: string,
    creation_time: string,
    update_time: string,

    // bonus fields
    /**
     * Repository name without project name.
     * .../<repository-name>
     */
    name_short?: string,
    /**
     * Project name without repository name.
     * <project-name>/...
     */
    project_name?: string,
};

export type ProjectRepositorySearchResult = {
    /**
     * Full repository name
     * <project-name>/<repository-name>
     */
    repository_name: string,
    project_name: string,
    artifact_count: number,
    project_public: boolean,
    project_id: number,
    pull_count: number
};

export type ProjectRepositoryNameParsed = {
    /**
     * Project name without repository name.
     * <project-name>/...
     */
    projectName: string,
    /**
     * Project name without repository name.
     * <project-name>/...
     */
    repositoryName: string
};

export type ProjectRepositoryFindOneOptions = {
    projectName: string,
    repositoryName: string
};

export type ProjectRepositoryGetOneOptions = {
    projectName: string,
    repositoryName: string
};

export type ProjectRepositoryGetManyOptions = {
    projectName: string
};

export type ProjectRepositoryUpdateOptions = {
    projectName: string,
    repositoryName: string
};

export type ProjectRepositoryDeleteOptions = {
    projectName: string,
    repositoryName: string
};
