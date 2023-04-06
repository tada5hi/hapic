/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Config as BaseConfig } from 'hapic';
import type { Project } from './project';
import type { SearchRepository } from './project-repository';

export type ConnectionOptions = {
    host: string,
    user: string,
    password: string
};

export type SearchResult = {
    project: Project[],
    repository: SearchRepository[]
};

export type Config = BaseConfig & {
    connectionString?: string,
    connectionOptions?: ConnectionOptions
};

export type ConfigInput = Partial<Config>;
