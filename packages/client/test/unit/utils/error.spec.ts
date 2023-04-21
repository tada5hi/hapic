/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ClientError,
    isClientError,
    isClientErrorDueNetworkIssue,
    isClientErrorWithStatusCode,
} from '../../../src';

describe('src/utils/error', () => {
    it('should detect request error', () => {
        expect(isClientError()).toBeFalsy();

        const error = new ClientError({
            request: {
                url: 'http://localhost:3000/',
            },
            message: '',
        });

        expect(isClientError(error)).toBeTruthy();
        expect(error.request.url).toEqual('http://localhost:3000/');
    });

    it('should detect request error with status code', () => {
        expect(isClientErrorWithStatusCode(undefined, 400)).toBeFalsy();
    });

    it('should detect network error', () => {
        expect(isClientErrorDueNetworkIssue()).toBeFalsy();
    });
});
