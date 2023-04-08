/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isNetworkError, isRequestError, isRequestErrorWithStatusCode } from '../../../src';

describe('src/utils/error', () => {
    it('should detect request error', () => {
        expect(isRequestError()).toBeFalsy();

        expect(isRequestError({ isAxiosError: true })).toBeTruthy();
    });

    it('should detect request error with status code', () => {
        expect(isRequestErrorWithStatusCode(undefined, 400)).toBeFalsy();
        expect(isRequestErrorWithStatusCode({ isAxiosError: true }, 400)).toBeFalsy();

        expect(isRequestErrorWithStatusCode({ isAxiosError: true, response: { status: 400 } }, 400)).toBeTruthy();
        expect(isRequestErrorWithStatusCode({ isAxiosError: true, response: { status: 400 } }, [500, 400])).toBeTruthy();
    });

    it('should detect network error', () => {
        expect(isNetworkError()).toBeFalsy();

        expect(isNetworkError({ code: 'ECONNRESET' })).toBeTruthy();
    });
});
