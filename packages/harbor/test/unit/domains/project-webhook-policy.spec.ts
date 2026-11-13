/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { HeaderName, ProjectWebhookPolicyAPI } from '../../../src';
import type { ProjectWebhookEventType } from '../../../src';

describe('src/domains/project-webhook-policy', () => {
    it('should create resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await api.create({
            projectIdOrName: 1,
            data: {
                name: 'foo',
                project_id: 1,
                description: '',
                event_types: ['SCANNING_STOPPED', 'QUOTA_EXCEED'],
                targets: [{
                    type: 'http', 
                    address: 'https://example.com', 
                    skip_cert_verify: false, 
                }],
            },
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects/1/webhook/policies');
        expect(JSON.parse(request.body as string)).toEqual({
            project_id: 1,
            enabled: true,
            description: '',
            event_types: ['SCANNING_STOPPED', 'QUOTA_EXCEED'],
            name: 'foo',
            targets: [{
                type: 'http', 
                address: 'https://example.com', 
                skip_cert_verify: false, 
            }],
        });
    });

    it('should not force event types or targets on create', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await api.create({
            projectIdOrName: 1,
            data: { name: 'foo', enabled: false },
        });

        expect(JSON.parse(transport.requests.at(-1)!.body as string)).toEqual({
            name: 'foo',
            enabled: false,
        });
    });

    it('should not mutate the input on create', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });
        const data = { event_types: ['PULL_ARTIFACT' as const] };

        await api.create({ projectIdOrName: 1, data });

        expect(data).toEqual({ event_types: ['PULL_ARTIFACT'] });

        const body = JSON.parse(transport.requests.at(-1)!.body as string);

        expect(body.event_types).toEqual(['PULL_ARTIFACT']);
        expect(typeof body.name).toBe('string');
        expect(body.name.length).toBeGreaterThan(0);
    });

    it('should get resources', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });
        const { data } = await api.getMany({
            projectIdOrName: 'foo',
            query: { page_size: 10 },
        });

        expect(data).toEqual([]);

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/foo/webhook/policies?page_size=10');
    });

    it('should get resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: { name: 'foo/bar' },
            }),
        });

        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });
        const result = await api.getOne({ projectIdOrName: 1, id: 1 });

        expect(result.name).toBe('foo/bar');

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/1/webhook/policies/1');
    });

    it('should find resource', async () => {
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: [],
            }),
        });

        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await api.findOne({ projectIdOrName: 1, name: 'bar' });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('GET');
        expect(request.url).toBe('projects/1/webhook/policies?q=name%3Dbar&page_size=1');
    });

    it('should update resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });
        const data = { name: 'baz', event_types: ['TAG_RETENTION' as const] };

        await api.update({
            projectIdOrName: 1,
            id: 1,
            data,
        });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('PUT');
        expect(request.url).toBe('projects/1/webhook/policies/1');
        expect(JSON.parse(request.body as string)).toEqual({
            enabled: true,
            event_types: ['TAG_RETENTION'],
            id: 1,
            name: 'baz',
        });
        expect(data).toEqual({ name: 'baz', event_types: ['TAG_RETENTION'] });
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await api.delete({ projectIdOrName: 1, id: 1 });

        const request = transport.requests.at(-1)!;

        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/1/webhook/policies/1');
    });

    it('should type the event types accepted by Harbor', () => {
        const supported = [
            'PUSH_ARTIFACT',
            'PULL_ARTIFACT',
            'DELETE_ARTIFACT',
            'QUOTA_EXCEED',
            'QUOTA_WARNING',
            'SCANNING_FAILED',
            'SCANNING_STOPPED',
            'SCANNING_COMPLETED',
            'REPLICATION',
            'TAG_RETENTION',
        ] satisfies ProjectWebhookEventType[];

        // @ts-expect-error QUOTA_EXCEEDED is not a Harbor event type
        const quota: ProjectWebhookEventType = 'QUOTA_EXCEEDED';
        // @ts-expect-error chart events are not Harbor event types
        const chart: ProjectWebhookEventType = 'UPLOAD_CHART';

        expect(supported).toHaveLength(10);
        expect([quota, chart]).toHaveLength(2);
    });

    function jsonTransport(body: unknown, headers: Record<string, string> = {}) {
        return new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'application/json', ...headers },
                body,
            }),
        });
    }

    function describeRequest(transport: MemoryTransport) {
        const request = transport.requests.at(-1)!;

        return [
            request.method,
            request.url,
            (request.headers as Headers).get(HeaderName.IS_RESOURCE_NAME),
        ];
    }

    it('should get the supported event types', async () => {
        const body = {
            event_type: ['PUSH_ARTIFACT'],
            notify_type: ['http', 'slack'],
            payload_formats: [{ notify_type: 'http', formats: ['Default', 'CloudEvents'] }],
        };
        const transport = jsonTransport(body);
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await expect(api.getSupportedEvents({ projectIdOrName: 'p', isProjectName: true })).resolves.toEqual(body);
        expect(describeRequest(transport)).toEqual(['GET', 'projects/p/webhook/events', 'true']);
    });

    it('should get the last triggers', async () => {
        const body = [{
            policy_name: 'foo', 
            event_type: 'PUSH_ARTIFACT', 
            enabled: true, 
        }];
        const transport = jsonTransport(body);
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await expect(api.getLastTriggers({ projectIdOrName: 1 })).resolves.toEqual(body);
        expect(describeRequest(transport)).toEqual(['GET', 'projects/1/webhook/lasttrigger', null]);
    });

    it('should get the executions of a policy', async () => {
        const transport = jsonTransport([{ id: 7, status: 'Success' }], { 'x-total-count': '9' });
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        const response = await api.getExecutions({
            projectIdOrName: 'p',
            isProjectName: true,
            id: 3,
            query: { page_size: 1, sort: ['-id'] },
        });

        expect(response).toEqual({ data: [{ id: 7, status: 'Success' }], meta: { total: 9 } });
        expect(describeRequest(transport)).toEqual([
            'GET',
            'projects/p/webhook/policies/3/executions?page_size=1&sort=-id',
            'true',
        ]);
    });

    it('should get the tasks of an execution', async () => {
        const transport = jsonTransport([{ id: 11, execution_id: 7 }], { 'x-total-count': '1' });
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        const response = await api.getExecutionTasks({
            projectIdOrName: 1,
            id: 3,
            executionId: 7,
        });

        expect(response).toEqual({ data: [{ id: 11, execution_id: 7 }], meta: { total: 1 } });
        expect(describeRequest(transport)).toEqual(['GET', 'projects/1/webhook/policies/3/executions/7/tasks', null]);
    });

    it('should get the log of a task as text', async () => {
        const log = '{"status": "ok"}\nline 2\n';
        const transport = new MemoryTransport({
            fetch: () => ({
                status: 200,
                headers: { 'content-type': 'text/plain' },
                body: log,
            }),
        });
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        const output = await api.getExecutionTaskLog({
            projectIdOrName: 'p',
            isProjectName: true,
            id: 3,
            executionId: 7,
            taskId: 11,
        });

        expect(output).toBe(log);
        expect(describeRequest(transport)).toEqual([
            'GET',
            'projects/p/webhook/policies/3/executions/7/tasks/11/log',
            'true',
        ]);
    });
});
