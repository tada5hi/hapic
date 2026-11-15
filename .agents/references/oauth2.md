# OAuth2 / OpenID Connect reference

Read before changing `packages/oauth2`. The mapping is taken from the client code and has not been checked against the specs yet, except the authorization request parameters.

Source of truth: [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) (OAuth 2.0), [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636) (PKCE), [RFC 7009](https://datatracker.ietf.org/doc/html/rfc7009) (revocation), [RFC 7662](https://datatracker.ietf.org/doc/html/rfc7662) (introspection), [RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707) (resource indicators), [RFC 8628](https://datatracker.ietf.org/doc/html/rfc8628) (device authorization grant), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html), [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).

## Endpoint mapping

Endpoints come from the client options (set them from provider metadata); the fallback paths are relative to the base URL.

| Upstream | This project (`packages/oauth2/src/`) |
|---|---|
| Authorization request (RFC 6749 4.1.1, OIDC Core 3.1.2.1), fallback `authorize` | `domains/authorize/` `AuthorizeAPI.buildURL`, `buildAuthorizeURL` |
| Token endpoint (RFC 6749 3.2), fallback `/token` | `domains/token/module.ts` `create`, `createWith*` |
| Revocation (RFC 7009), fallback `/token/revoke` | `domains/token/module.ts` `revoke` |
| Introspection (RFC 7662), fallback `/token/introspect` | `domains/token/module.ts` `introspect` |
| UserInfo (OIDC Core 5.3), fallback `/userinfo` | `domains/userinfo/` |
| Device authorization (RFC 8628 3.1, 3.2), fallback `/device_authorization`; metadata `device_authorization_endpoint` (RFC 8628 4) | `domains/device-authorization/` `DeviceAuthorizationAPI.create`. Sends `scope` and the client authentication by the token API header rules; keeps only the RFC 8628 3.2 response fields |
| Device access token request (RFC 8628 3.4), polling (3.5) | `domains/token/module.ts` `createWithDeviceCode`, `pollWithDeviceCode`. No `scope` is sent. Default interval 5 s, `slow_down` adds 5 s for all later requests. `expires_in` is counted from the start of `pollWithDeviceCode`, not from the authorization response, and the last pending error is thrown instead of a dedicated expiry error |
| Provider metadata (OIDC Discovery 3) | `open-id/` |
