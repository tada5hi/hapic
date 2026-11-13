/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { RobotAPI, buildRobotPermissionForAllResources } from '../../../src';
import type {
    Robot,
    RobotCreatePayload,
    RobotGetManyContext,
    RobotPermission,
} from '../../../src';

const permissions : RobotPermission[] = [{
    kind: 'project',
    namespace: 'foo',
    access: [{ resource: 'repository', action: 'pull' }],
}];

describe('src/domains/robot', () => {
    it('should build robot permission object for global access', () => {
        const robotPermission = buildRobotPermissionForAllResources('*');

        expect(robotPermission.namespace).toEqual('*');
        expect(robotPermission.kind).toEqual('project');
        expect(robotPermission.access.length).toBeGreaterThan(0);
    });

    it('should create resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 201,
                headers: { 'content-type': 'application/json' },
                body: { id: 1, name: 'robot$foo+robi' },
            }),
        });

        const api = new RobotAPI({ client: createClient({ transport }) });
        const data : RobotCreatePayload = {
            name: 'robi', 
            level: 'project', 
            permissions, 
        };

        const robot = await api.create(data);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('robots');
        expect(JSON.parse(request.body as string)).toEqual({
            name: 'robi',
            level: 'project',
            permissions,
            duration: -1,
        });
        expect(data).toEqual({
            name: 'robi', 
            level: 'project', 
            permissions, 
        });
        expect(robot.id).toBe(1);
    });

    it('should keep the duration on create', async () => {
        const transport = new MemoryTransport();
        const api = new RobotAPI({ client: createClient({ transport }) });

        await api.create({
            name: 'robi',
            level: 'system',
            duration: 30,
            permissions: [{
                ...permissions[0], 
                kind: 'system', 
                namespace: '/', 
            }],
        });

        const body = JSON.parse(transport.requests.at(-1)!.body as string);

        expect(body.duration).toBe(30);
        expect(body.level).toBe('system');
        expect(body.permissions[0].kind).toBe('system');
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();

        const api = new RobotAPI({ client: createClient({ transport }) });

        await api.delete(1);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('robots/1');
        expect(request.body).toBeUndefined();
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport();

        const api = new RobotAPI({ client: createClient({ transport }) });
        const data = {
            name: 'robus', 
            level: 'project' as const, 
            permissions, 
        };

        await api.update(1, data);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('PUT');
        expect(request.url).toBe('robots/1');
        expect(JSON.parse(request.body as string)).toEqual({
            id: 1,
            name: 'robus',
            level: 'project',
            permissions,
        });
        expect(data).toEqual({
            name: 'robus', 
            level: 'project', 
            permissions, 
        });
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new RobotAPI({ client: createClient({ transport }) });
        const { data } = await api.getMany({ query: { page_size: 10 } });

        expect(data).toEqual([]);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('robots?page_size=10');
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: {},
            }),
        });

        const api = new RobotAPI({ client: createClient({ transport }) });

        await api.getOne(1);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('robots/1');
    });

    it('should join multiple q keys with a comma', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });
        const api = new RobotAPI({ client: createClient({ transport }) });

        await api.getMany({
            query: {
                q: {
                    Level: 'project', 
                    ProjectID: 1, 
                    name: 'robot$foo', 
                }, 
            }, 
        });

        expect(transport.requests.at(-1)!.url).toBe('robots?q=Level%3Dproject%2CProjectID%3D1%2Cname%3Drobot%2524foo');
    });

    it('should type robot levels and list filters as Harbor does', () => {
        const robot : Robot = {
            id: 1, 
            name: 'robot$foo+bar', 
            level: 'project', 
        };
        const permission : RobotPermission = {
            kind: 'system', 
            namespace: '/', 
            access: [], 
        };
        const context : RobotGetManyContext = { query: { q: { Level: 'project', ProjectID: 1 } } };

        // @ts-expect-error Harbor reads the capitalised `Level` key
        const lowercase : RobotGetManyContext = { query: { q: { level: 'project' } } };

        // @ts-expect-error a robot is created with a level and permissions
        const incomplete : RobotCreatePayload = { name: 'robi' };

        expect([robot, permission, context, lowercase, incomplete]).toHaveLength(5);
    });
});
