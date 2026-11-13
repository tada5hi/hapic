/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { ProjectWebhookPolicyAPI } from '../../../src';
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
});
