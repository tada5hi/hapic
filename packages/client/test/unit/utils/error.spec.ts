/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isNetworkError, isRequestError } from '../../../src';

describe('src/utils/error', () => {
    it('should detect request error', () => {
        expect(isRequestError()).toBeFalsy();

        expect(isRequestError({ config: {}, isAxiosError: true })).toBeTruthy();
    });

    it('should detect network error', () => {
        expect(isNetworkError()).toBeFalsy();

        expect(isNetworkError({ code: 'ECONNRESET' })).toBeTruthy();
    });
});
