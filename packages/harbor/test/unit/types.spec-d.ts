/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Project,
    ProjectArtifact,
    ProjectArtifactGetManyQuery,
    ProjectArtifactLabel,
    ProjectArtifactTag,
    ProjectCreatePayload,
    ProjectMetadata,
    ProjectWebhookPolicy,
    ProjectWebhookTarget,
    Robot,
    RobotPermissionAccess,
} from '../../src';

/*
 * Type-level checks against the Harbor v2.16.0 swagger definitions.
 * They are enforced by the TypeScript compiler (`tsc --noEmit`),
 * the runtime assertions are no-ops.
 */
describe('types (harbor v2.16.0)', () => {
    it('should type artifact tags and list queries without notary signatures', () => {
        expectTypeOf<ProjectArtifactTag>().not.toHaveProperty('signed');
        expectTypeOf<ProjectArtifactGetManyQuery>().not.toHaveProperty('with_signature');
        expectTypeOf<ProjectArtifactGetManyQuery>().toHaveProperty('with_sbom_overview');
        expectTypeOf<ProjectArtifactGetManyQuery>().toHaveProperty('with_accessory');
        expectTypeOf<ProjectArtifactGetManyQuery>().toHaveProperty('with_inherited_accessory');
    });

    it('should type all artifact fields', () => {
        expectTypeOf<ProjectArtifact>().toHaveProperty('media_type');
        expectTypeOf<ProjectArtifact>().toHaveProperty('manifest_media_type');
        expectTypeOf<ProjectArtifact>().toHaveProperty('artifact_type');
        expectTypeOf<ProjectArtifact>().toHaveProperty('repository_name');
        expectTypeOf<ProjectArtifact>().toHaveProperty('icon');
        expectTypeOf<ProjectArtifact>().toHaveProperty('extra_attrs');
        expectTypeOf<ProjectArtifact>().toHaveProperty('annotations');
        expectTypeOf<ProjectArtifact>().toHaveProperty('references');
        expectTypeOf<ProjectArtifact>().toHaveProperty('addition_links');
        expectTypeOf<ProjectArtifact>().toHaveProperty('scan_overview');
        expectTypeOf<ProjectArtifact>().toHaveProperty('sbom_overview');
        expectTypeOf<ProjectArtifact>().toHaveProperty('accessories');
        expectTypeOf<ProjectArtifact>().toHaveProperty('inherited_accessories');
    });

    it('should type all label fields', () => {
        expectTypeOf<ProjectArtifactLabel>().toHaveProperty('description');
        expectTypeOf<ProjectArtifactLabel>().toHaveProperty('color');
        expectTypeOf<ProjectArtifactLabel>().toHaveProperty('project_id');
    });

    it('should type webhook policies and targets', () => {
        expectTypeOf<ProjectWebhookPolicy>().toHaveProperty('creator');
        expectTypeOf<ProjectWebhookPolicy['enabled']>().toEqualTypeOf<boolean>();
        expectTypeOf<ProjectWebhookTarget['type']>().toEqualTypeOf<'http' | 'slack'>();
        expectTypeOf<ProjectWebhookTarget['payload_format']>()
            .toEqualTypeOf<'Default' | 'CloudEvents' | undefined>();
    });

    it('should type all project fields', () => {
        expectTypeOf<Project>().toHaveProperty('deleted');
        expectTypeOf<Project>().toHaveProperty('togglable');
        expectTypeOf<Project>().toHaveProperty('current_user_role_ids');
        expectTypeOf<Project>().toHaveProperty('cve_allowlist');
    });

    it('should type the project create payload as swagger ProjectReq', () => {
        expectTypeOf<ProjectCreatePayload['registry_id']>().toEqualTypeOf<number | null | undefined>();
        expectTypeOf<ProjectCreatePayload>().toHaveProperty('metadata');
        expectTypeOf<ProjectCreatePayload>().toHaveProperty('cve_allowlist');
        expectTypeOf<ProjectCreatePayload>().toHaveProperty('retention_days');
    });

    it('should type the project metadata added in v2.16', () => {
        expectTypeOf<ProjectMetadata>().toHaveProperty('proxy_referrer_api');
        expectTypeOf<ProjectMetadata>().toHaveProperty('proxy_cache_filter_pattern');
        expectTypeOf<ProjectMetadata['proxy_cache_filter_kind']>()
            .toEqualTypeOf<'doublestar' | 'regex' | '' | undefined>();
    });

    it('should type robot access effects and creators', () => {
        expectTypeOf<RobotPermissionAccess['effect']>().toEqualTypeOf<'allow' | 'deny' | undefined>();
        expectTypeOf<Robot>().toHaveProperty('creator_type');
        expectTypeOf<Robot>().toHaveProperty('creator_ref');
    });
});
