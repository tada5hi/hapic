/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Headers } from 'hapic';
import { HeaderName, extractResourceIDOfResponse } from '../../../src';

describe('src/utils/resource-id', () => {
    it('should extract resource id of response', () => {
        const headers = new Headers();
        headers.set(HeaderName.LOCATION, '/api/v2.0/projects/50');

        const id = extractResourceIDOfResponse({
            headers,
        });

        expect(id).toEqual(50);
    });

    it('should no extract resource id of response', () => {
        let id = extractResourceIDOfResponse({
            headers: new Headers(),
        });

        expect(id).toBeUndefined();

        const headers = new Headers();
        headers.set(HeaderName.LOCATION, '/api/v2.0/projects/foo');

        id = extractResourceIDOfResponse({
            headers,
        });

        expect(id).toBeUndefined();
    });
});
