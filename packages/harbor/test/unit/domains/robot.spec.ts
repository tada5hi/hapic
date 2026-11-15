/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import {
    RobotAPI,
    buildRobotPermissionForAllResources,
    buildRobotPermissionForAllSystemResources,
} from '../../../src';
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

    it('should grant every project-scope robot policy of harbor v2.16.0', () => {
        // PoliciesMap[ScopeProject] in src/common/rbac/const.go at v2.16.0
        const expected = [
            'log:list',
            'project:read', 
            'project:delete', 
            'project:update',
            'metadata:read', 
            'metadata:create', 
            'metadata:delete', 
            'metadata:list', 
            'metadata:update',
            'repository:read', 
            'repository:update', 
            'repository:delete', 
            'repository:list', 
            'repository:pull', 
            'repository:push',
            'artifact:read', 
            'artifact:create', 
            'artifact:list', 
            'artifact:delete',
            'scan:create', 
            'scan:read', 
            'scan:stop',
            'sbom:create', 
            'sbom:stop', 
            'sbom:read',
            'tag:create', 
            'tag:list', 
            'tag:delete',
            'accessory:list',
            'artifact-addition:read',
            'artifact-label:create', 
            'artifact-label:delete',
            'scanner:create', 
            'scanner:read',
            'preheat-policy:read', 
            'preheat-policy:create', 
            'preheat-policy:delete', 
            'preheat-policy:list', 
            'preheat-policy:update',
            'immutable-tag:create', 
            'immutable-tag:delete', 
            'immutable-tag:list', 
            'immutable-tag:update',
            'notification-policy:read', 
            'notification-policy:create', 
            'notification-policy:delete',
            'notification-policy:list', 
            'notification-policy:update',
            'tag-retention:read', 
            'tag-retention:create', 
            'tag-retention:delete', 
            'tag-retention:list', 
            'tag-retention:update',
            'label:read', 
            'label:create', 
            'label:delete', 
            'label:list', 
            'label:update',
            'quota:read',
        ];

        const permission = buildRobotPermissionForAllResources('p');

        expect(permission.kind).toBe('project');
        expect(permission.namespace).toBe('p');
        expect(permission.access.map((item) => `${item.resource}:${item.action}`).sort())
            .toEqual([...expected].sort());
    });

    it('should grant every system-scope robot policy of harbor v2.16.0', () => {
        // PoliciesMap[ScopeSystem] in src/common/rbac/const.go at v2.16.0
        const expected = [
            'audit-log:list',
            'preheat-instance:read', 
            'preheat-instance:create', 
            'preheat-instance:delete',
            'preheat-instance:list', 
            'preheat-instance:update',
            'project:list', 
            'project:create',
            'replication-policy:read', 
            'replication-policy:create', 
            'replication-policy:delete',
            'replication-policy:list', 
            'replication-policy:update',
            'replication:read', 
            'replication:create', 
            'replication:list',
            'replication-adapter:list',
            'registry:read', 
            'registry:create', 
            'registry:delete', 
            'registry:list', 
            'registry:update',
            'scan-all:read', 
            'scan-all:update', 
            'scan-all:stop', 
            'scan-all:create',
            'system-volumes:read',
            'garbage-collection:read', 
            'garbage-collection:create', 
            'garbage-collection:list',
            'garbage-collection:update', 
            'garbage-collection:stop',
            'purge-audit:read', 
            'purge-audit:create', 
            'purge-audit:list', 
            'purge-audit:update', 
            'purge-audit:stop',
            'jobservice-monitor:list', 
            'jobservice-monitor:stop',
            'scanner:read', 
            'scanner:create', 
            'scanner:delete', 
            'scanner:list', 
            'scanner:update',
            'label:read', 
            'label:create', 
            'label:delete', 
            'label:update',
            'security-hub:read', 
            'security-hub:list',
            'catalog:read',
            'quota:read', 
            'quota:list',
        ];

        const permission = buildRobotPermissionForAllSystemResources();

        expect(permission.kind).toBe('system');
        expect(permission.namespace).toBe('/');
        expect(permission.access.map((item) => `${item.resource}:${item.action}`).sort())
            .toEqual([...expected].sort());
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
