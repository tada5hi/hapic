/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTransport, createClient } from 'hapic';
import { ProjectWebhookPolicyAPI } from '../../../src';

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
            },
        });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('POST');
        expect(request.url).toBe('projects/1/webhook/policies');
        expect(JSON.parse(request.body as string)).toEqual({
            project_id: 1,
            enabled: true,
            description: '',
            event_types: ['PUSH_ARTIFACT'],
            name: 'foo',
            targets: [],
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

        await api.update({
            projectIdOrName: 1,
            id: 1,
            data: { name: 'baz' },
        });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('PUT');
        expect(request.url).toBe('projects/1/webhook/policies/1');
        expect(JSON.parse(request.body as string)).toEqual({
            enabled: true,
            event_types: ['PUSH_ARTIFACT'],
            id: 1,
            name: 'baz',
            targets: [],
        });
    });

    it('should delete resource', async () => {
        const transport = new MemoryTransport();
        const api = new ProjectWebhookPolicyAPI({ client: createClient({ transport }) });

        await api.delete({ projectIdOrName: 1, id: 1 });

        const request = transport.requests.at(-1)!;
        expect(request.method).toBe('DELETE');
        expect(request.url).toBe('projects/1/webhook/policies/1');
    });
});
