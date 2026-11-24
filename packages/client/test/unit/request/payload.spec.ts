/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isRequestPayloadSupported } from '../../../src';

describe('src/request/payload', () => {
    it.each(['GET', 'HEAD', 'get', 'head'])('should not support a payload for %s', (method) => {
        expect(isRequestPayloadSupported(method)).toBe(false);
    });

    it('should not support a payload without a method (GET)', () => {
        expect(isRequestPayloadSupported()).toBe(false);
    });

    it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'delete', 'PROPFIND'])('should support a payload for %s', (method) => {
        expect(isRequestPayloadSupported(method)).toBe(true);
    });
});
