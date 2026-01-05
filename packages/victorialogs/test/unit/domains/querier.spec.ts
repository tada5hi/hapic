/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, createClient } from 'hapic';
import { QuerierAPI } from '../../../src';

describe('src/domains/distributor', () => {
    it('should query', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const query : string = 'log.level:*';

        const api = new QuerierAPI({ client: driver });
        await api.query({
            query,
            limit: 10,
        });

        expect(fn).toHaveBeenCalledWith(
            'select/logsql/query',
            {
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
                },
                params: {
                    query,
                    limit: 10,
                },
            },
        );
    });
});
