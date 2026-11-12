/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ResponseType, detectResponseType } from '../../../src';

describe('src/response/utils/type-detect', () => {
    it('should detect an event stream as stream', () => {
        expect(detectResponseType('text/event-stream')).toEqual(ResponseType.STREAM);
        expect(detectResponseType('text/event-stream; charset=utf-8')).toEqual(ResponseType.STREAM);
        expect(detectResponseType('Text/Event-Stream')).toEqual(ResponseType.STREAM);
    });

    it('should detect other text types as text', () => {
        expect(detectResponseType('text/plain')).toEqual(ResponseType.TEXT);
    });
});
