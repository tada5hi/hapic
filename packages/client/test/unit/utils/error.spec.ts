/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ClientError, hasClientFailedDueNetworkError, hasClientFailedWithStausCode, isClientError,
} from '../../../src';

describe('src/utils/error', () => {
    it('should detect request error', () => {
        expect(isClientError()).toBeFalsy();

        const error = new ClientError({
            request: '',
            message: '',
        });

        expect(isClientError(error)).toBeTruthy();
    });

    it('should detect request error with status code', () => {
        expect(hasClientFailedWithStausCode(undefined, 400)).toBeFalsy();
    });

    it('should detect network error', () => {
        expect(hasClientFailedDueNetworkError()).toBeFalsy();
    });
});
