/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, createClient } from 'hapic';
import { IngestorAPI } from '../../../src';
import type { IngestorData } from '../../../src';

describe('src/domains/distributor', () => {
    it('should create resource', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.post = fn;

        const payload : IngestorData = {
            app: 'foo',
            _msg: 'This is a log message.',
        };

        const api = new IngestorAPI({ client: driver });
        await api.insert(payload);

        expect(fn).toHaveBeenCalledWith(
            '/insert/jsonline',
            payload,
            {
                headers: {
                    [HeaderName.CONTENT_TYPE]: 'application/json',
                },
            },
        );
    });
});
