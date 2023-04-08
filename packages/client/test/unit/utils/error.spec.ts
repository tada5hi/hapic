/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasDriverFailedDueNetworkError, hasDriverFailedWithStausCode, isDriverError } from '../../../src';

describe('src/utils/error', () => {
    it('should detect request error', () => {
        expect(isDriverError()).toBeFalsy();

        expect(isDriverError({ isAxiosError: true })).toBeTruthy();
    });

    it('should detect request error with status code', () => {
        expect(hasDriverFailedWithStausCode(undefined, 400)).toBeFalsy();
        expect(hasDriverFailedWithStausCode({ isAxiosError: true }, 400)).toBeFalsy();

        expect(hasDriverFailedWithStausCode({ isAxiosError: true, response: { status: 400 } }, 400)).toBeTruthy();
        expect(hasDriverFailedWithStausCode({ isAxiosError: true, response: { status: 400 } }, [500, 400])).toBeTruthy();
    });

    it('should detect network error', () => {
        expect(hasDriverFailedDueNetworkError()).toBeFalsy();

        expect(hasDriverFailedDueNetworkError({ isAxiosError: true, code: 'ECONNRESET' })).toBeTruthy();
    });
});
