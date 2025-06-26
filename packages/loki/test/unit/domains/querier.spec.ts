/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HeaderName, createClient } from 'hapic';
import type { QuerierQueryOptions, QuerierQueryRangeOptions } from '../../../src';
import { QuerierAPI } from '../../../src';

describe('src/domains/distributor', () => {
    it('should query', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const payload : QuerierQueryOptions = {
            query: '{app="foo"}',
            limit: 10,
            direction: 'backward',
            time: 0,
        };

        const api = new QuerierAPI({ client: driver });
        await api.query(payload);

        expect(fn).toHaveBeenCalledWith(
            'loki/api/v1/query',
            {
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
                },
                params: payload,
            },
        );
    });

    it('should query range', async () => {
        const driver = createClient();
        const fn = jest.fn();
        fn.mockReturnValue({ data: {} });
        driver.get = fn;

        const payload : QuerierQueryRangeOptions = {
            query: '{app="foo"}',
            limit: 10,
            direction: 'backward',
            start: 0,
            end: 1,
        };

        const api = new QuerierAPI({ client: driver });
        await api.queryRange(payload);

        expect(fn).toHaveBeenCalledWith(
            'loki/api/v1/query_range',
            {
                headers: {
                    [HeaderName.ACCEPT]: 'application/json',
                },
                params: payload,
            },
        );
    });
});
