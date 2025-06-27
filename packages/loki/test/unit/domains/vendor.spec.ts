/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, createClient } from 'hapic';
import { DistributorAPI, nanoSeconds } from '../../../src';
import type { DistributorPushStream } from '../../../src';

describe('src/domains/distributor', () => {
    it('should create resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const payload : DistributorPushStream = {
            stream: {
                app: 'foo',
            },
            values: [
                [nanoSeconds(), 'This is a log message.'],
            ],
        };

        const api = new DistributorAPI({ client: driver });
        await api.push(payload);

        expect(fn).toHaveBeenCalledWith(
            'loki/api/v1/push',
            {
                streams: [
                    payload,
                ],
            },
            {
                headers: {
                    [HeaderName.CONTENT_TYPE]: 'application/json',
                },
            },
        );
    });
});
