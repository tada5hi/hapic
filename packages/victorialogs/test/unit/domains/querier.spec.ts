/*
 * Copyright (c) 2023-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createClient } from 'hapic';
import { HeaderName, QuerierAPI } from '../../../src';

describe('src/domains/distributor', () => {
    it('should query', async () => {
        const driver = createClient();
        const fn = jest.fn();

        const text = '{"_time":"2026-01-07T10:56:35.399492947Z","_stream_id":"","_stream":"{}","_msg":"world!"}\n' +
            '{"_time":"2026-01-07T10:56:40.399492947Z","_stream_id":"","_stream":"{}","_msg":"Hello"}';

        const bytes = new TextEncoder().encode(text);

        fn.mockReturnValue({
            status: 200,
            headers: {
                [HeaderName.CONTENT_TYPE]: 'application/stream+json',
                [HeaderName.CONTENT_LENGTH]: bytes.length,
            },
            data: new ReadableStream({
                start(controller) {
                    controller.enqueue(bytes);
                    controller.close();
                },
            }),
        });
        driver.get = fn;

        const query : string = 'log.level:*';

        const api = new QuerierAPI({ client: driver });
        const response = await api.query({
            query,
            limit: 10,
        });

        expect(response.length).toEqual(2);

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
                responseType: 'stream',
            },
        );
    });
});
