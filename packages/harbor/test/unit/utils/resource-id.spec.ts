/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, extractResourceIDOfResponse } from '../../../src';

describe('src/utils/resource-id', () => {
    it('should extract resource id of response', () => {
        const id = extractResourceIDOfResponse({
            headers: {
                [HeaderName.LOCATION]: '/api/v2.0/projects/50',
            },
        });

        expect(id).toEqual(50);
    });

    it('should no extract resource id of response', () => {
        let id = extractResourceIDOfResponse({
            headers: {},
        });

        expect(id).toBeUndefined();

        id = extractResourceIDOfResponse({
            headers: {
                [HeaderName.LOCATION]: '/api/v2.0/projects/foo',
            },
        });

        expect(id).toBeUndefined();
    });
});
