/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { RobotAPI, buildRobotPermissionForAllResources } from '../../../src';

describe('src/domains/robot', () => {
    it('should build robot permission object for global access', () => {
        const robotPermission = buildRobotPermissionForAllResources('*');
        expect(robotPermission.namespace).toEqual('*');
        expect(robotPermission.kind).toEqual('project');
        expect(robotPermission.access.length).toBeGreaterThan(0);
    });

    it('should create resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 201,
            headers: { 'content-type': 'application/json' },
            body: { name: 'robi' },
        });

        const api = new RobotAPI({ client: createClient({ transport }) });
        await api.create({ name: 'robi' });

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('POST');
        expect(request.url).toBe('robots');
        expect(JSON.parse(request.init.body as string))
            .toEqual(api.extendPayload({ name: 'robi' }));
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();

        const api = new RobotAPI({ client: createClient({ transport }) });
        await api.delete(1);

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('DELETE');
        expect(request.url).toBe('robots/1');
        expect(request.init.body).toBeUndefined();
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport();

        const api = new RobotAPI({ client: createClient({ transport }) });
        await api.update(1, { name: 'robus' });

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('PUT');
        expect(request.url).toBe('robots/1');
        expect(JSON.parse(request.init.body as string))
            .toEqual(api.extendPayload({ name: 'robus', id: 1 }));
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: [],
        });

        const api = new RobotAPI({ client: createClient({ transport }) });
        const { data } = await api.getMany({ query: { page_size: 10 } });

        expect(data).toEqual([]);

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('GET');
        expect(request.url).toBe('robots?page_size=10');
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport();
        transport.respondWith({
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: {},
        });

        const api = new RobotAPI({ client: createClient({ transport }) });
        await api.getOne(1);

        const request = transport.lastRequest!;
        expect(request.init.method).toBe('GET');
        expect(request.url).toBe('robots/1');
    });
});
