/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, createClient } from 'hapic';
import type {
    CompactorDeletionRequestCancel,
    CompactorDeletionRequestCreate,
} from '../../../src';
import {
    CompactorAPI,
} from '../../../src';

describe('src/domains/compactor', () => {
    it('should create deletion request', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const payload : CompactorDeletionRequestCreate = {
            query: '{app="foo"}',
            start: BigInt(1000),
        };

        const api = new CompactorAPI({ client: driver });
        await api.createDeletionRequest(payload);

        expect(fn).toHaveBeenCalledWith(
            'loki/api/v1/delete',
            {},
            {
                headers: {
                    [HeaderName.CONTENT_TYPE]: 'application/json',
                },
                params: payload,
            },
        );
    });

    it('should cancel deletion request', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.delete = fn;

        const payload : CompactorDeletionRequestCancel = {
            request_id: BigInt(1000),
            force: true,
        };

        const api = new CompactorAPI({ client: driver });
        await api.cancelDeletionRequest(payload);

        expect(fn).toHaveBeenCalledWith(
            'loki/api/v1/delete',
            {
                headers: {
                    [HeaderName.CONTENT_TYPE]: 'application/json',
                },
                params: payload,
            },
        );
    });
});
