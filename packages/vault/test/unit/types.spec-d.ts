/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    KeyValueV2API,
    KeyValueV2CreateResponse,
    KeyValueV2GetOneResponse,
    Mount,
    MountAPI,
    MountCreatePayload,
    MountCreatePayloadConfig,
    MountUpdatePayload,
    ResourceResponse,
} from '../../src';

describe('types', () => {
    it('should type custom metadata as a string map or null', () => {
        expectTypeOf<KeyValueV2GetOneResponse['data']['metadata']['custom_metadata']>()
            .toEqualTypeOf<Record<string, string> | null>();
        expectTypeOf<KeyValueV2CreateResponse['data']['custom_metadata']>()
            .toEqualTypeOf<Record<string, string> | null>();
    });

    it('should return the create shape from a key-value v2 patch', () => {
        expectTypeOf<ReturnType<KeyValueV2API['update']>>()
            .toEqualTypeOf<Promise<KeyValueV2CreateResponse>>();
    });

    it('should accept built-in and plugin mount types', () => {
        expectTypeOf<{ type: 'pki' }>().toExtend<MountCreatePayload>();
        expectTypeOf<{ type: 'transit' }>().toExtend<MountCreatePayload>();
        expectTypeOf<{ type: 'my-plugin' }>().toExtend<MountCreatePayload>();
    });

    it('should type the mount create payload after the api', () => {
        expectTypeOf<MountCreatePayload>().toHaveProperty('local');
        expectTypeOf<MountCreatePayload>().toHaveProperty('seal_wrap');
        expectTypeOf<MountCreatePayload>().toHaveProperty('external_entropy_access');
        expectTypeOf<MountCreatePayload>().not.toHaveProperty('generate_signing_key');

        expectTypeOf<MountCreatePayloadConfig>().toHaveProperty('allowed_managed_keys');
        expectTypeOf<MountCreatePayloadConfig>().toHaveProperty('delegated_auth_accessors');
        expectTypeOf<MountCreatePayloadConfig>().toHaveProperty('identity_token_key');

        expectTypeOf<{ type: 'kv', options: { version: '2' } }>().toExtend<MountCreatePayload>();
        expectTypeOf<{ type: 'kv', options: { version: 2 } }>().not.toExtend<MountCreatePayload>();
    });

    it('should type the mount tune payload after the api', () => {
        expectTypeOf<MountUpdatePayload>().toHaveProperty('allowed_response_headers');
        expectTypeOf<MountUpdatePayload>().toHaveProperty('delegated_auth_accessors');
        expectTypeOf<MountUpdatePayload['default_lease_ttl']>()
            .toEqualTypeOf<string | number | undefined>();
        expectTypeOf<MountUpdatePayload['max_lease_ttl']>()
            .toEqualTypeOf<string | number | undefined>();
    });

    it('should type a mount read separately from the create payload', () => {
        expectTypeOf<Mount>().toHaveProperty('accessor').toEqualTypeOf<string>();
        expectTypeOf<Mount>().toHaveProperty('uuid').toEqualTypeOf<string>();
        expectTypeOf<Mount>().toHaveProperty('local').toEqualTypeOf<boolean>();
        expectTypeOf<Mount>().toHaveProperty('seal_wrap').toEqualTypeOf<boolean>();
        expectTypeOf<Mount>().toHaveProperty('external_entropy_access').toEqualTypeOf<boolean>();
        expectTypeOf<Mount>().toHaveProperty('plugin_version').toEqualTypeOf<string>();
        expectTypeOf<Mount>().toHaveProperty('running_plugin_version').toEqualTypeOf<string>();
        expectTypeOf<Mount>().toHaveProperty('running_sha256').toEqualTypeOf<string>();
        expectTypeOf<Mount>().toHaveProperty('deprecation_status');
        expectTypeOf<Mount['config']['default_lease_ttl']>().toEqualTypeOf<number>();
        expectTypeOf<Mount['config']['max_lease_ttl']>().toEqualTypeOf<number>();

        expectTypeOf<ReturnType<MountAPI['getMany']>>()
            .toEqualTypeOf<Promise<ResourceResponse<Record<string, Mount>>>>();
        expectTypeOf<ReturnType<MountAPI['getOne']>>()
            .toEqualTypeOf<Promise<ResourceResponse<Mount>>>();
    });

    it('should type the response envelope', () => {
        expectTypeOf<ResourceResponse['warnings']>().toEqualTypeOf<string[] | null | undefined>();

        type WrapInfo = NonNullable<ResourceResponse['wrap_info']>;
        expectTypeOf<ResourceResponse['wrap_info']>().toExtend<WrapInfo | null | undefined>();
        expectTypeOf<WrapInfo>().toHaveProperty('token').toEqualTypeOf<string>();
        expectTypeOf<WrapInfo>().toHaveProperty('ttl').toEqualTypeOf<number>();
        expectTypeOf<WrapInfo>().toHaveProperty('creation_time').toEqualTypeOf<string>();
        expectTypeOf<WrapInfo>().toHaveProperty('creation_path').toEqualTypeOf<string>();

        type Auth = NonNullable<ResourceResponse['auth']>;
        expectTypeOf<Auth>().toHaveProperty('client_token').toEqualTypeOf<string>();
        expectTypeOf<Auth>().toHaveProperty('policies').toEqualTypeOf<string[]>();
        expectTypeOf<Auth>().toHaveProperty('lease_duration').toEqualTypeOf<number>();
        expectTypeOf<null>().toExtend<ResourceResponse['auth']>();
        expectTypeOf<null>().toExtend<ResourceResponse['wrap_info']>();
    });
});
