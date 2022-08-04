/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseProjectRepositoryName } from '../../src';

describe('src/project-repository', () => {
    it('should parse project repository name', () => {
        const parsed = parseProjectRepositoryName('project_name/repository_prefix/repository');
        expect(parsed).toBeDefined();
        expect(parsed.repository_name).toEqual('repository_prefix/repository');
        expect(parsed.project_name).toEqual('project_name');
    });
});
