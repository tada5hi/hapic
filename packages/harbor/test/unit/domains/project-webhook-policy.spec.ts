/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectWebhookPolicy } from '../../../src';
import {
    ProjectWebhookPolicyAPI,
    createDriver,
} from '../../../src';

describe('src/domains/project-webhook-policy', () => {
    it('should create resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.post = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.create({
            projectIdOrName: 1,
            data: {
                name: 'foo',
                project_id: 1,
                description: '',
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/1/webhook/policies',
            {
                project_id: 1,
                enabled: true,
                description: '',
                event_types: ['PUSH_ARTIFACT'],
                name: 'foo',
                targets: [],
            } satisfies Partial<ProjectWebhookPolicy>,
            {},
        );
    });
    it('should get resources', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.getMany({
            projectIdOrName: 'foo',
            query: {
                page_size: 10,
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/foo/webhook/policies?page_size=10',
            {},
        );
    });

    it('should get resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: { name: 'foo/bar' } });
        driver.get = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.getOne({
            projectIdOrName: 1,
            id: 1,
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/1/webhook/policies/1',
            {},
        );
    });

    it('should find resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue({ data: [] });
        driver.get = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.findOne({
            projectIdOrName: 1,
            name: 'bar',
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/1/webhook/policies?q=name%3Dbar&page_size=1',
            {},
        );
    });

    it('should update resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.put = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.update({
            projectIdOrName: 1,
            id: 1,
            data: {
                name: 'baz',
            },
        });

        expect(fn).toHaveBeenCalledWith(
            'projects/1/webhook/policies/1',
            {
                name: 'baz',
            },
            {},
        );
    });

    it('should delete resource', async () => {
        const driver = createDriver();
        const fn = jest.fn();
        fn.mockReturnValue(undefined);
        driver.delete = fn;

        const api = new ProjectWebhookPolicyAPI({ driver });
        await api.delete({
            projectIdOrName: 1,
            id: 1,
        });

        expect(fn).toHaveBeenLastCalledWith(
            'projects/1/webhook/policies/1',
            {},
        );
    });
});
