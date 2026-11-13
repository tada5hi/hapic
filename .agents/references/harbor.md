# Harbor reference

Read before changing `packages/harbor`. Compared on 2026-11-12 against the swagger and Go handlers of Harbor v2.15.5; nothing here was run against a live Harbor.

Source of truth: [Harbor REST API swagger](https://github.com/goharbor/harbor/blob/main/api/v2.0/swagger.yaml). `/api/v2.0` is the API path of every Harbor 2.x release; it is not the product version.

## Conventions

- `q` filters results: `key=value` (exact), `key=~value` (substring), several keys joined with `,` (not `&`). Harbor `QueryUnescape`s the whole `q` once more after the normal query decoding and only then splits it on `,` and the first `=` (`lib/q/builder.go`), so each `key=value` pair is form-encoded once before the normal query encoding (`buildQueryString` does this), and a value cannot contain `,`.
- `sort` is a comma-separated field list (`-field` descending); `page` and `page_size` (maximum 100) page the result; the total is in the `X-Total-Count` response header.
- `X-Is-Resource-Name: true` makes Harbor read a `{project_name_or_id}` path parameter as a name. Only the project and webhook policy routes declare it.
- A repository name containing `/` must be URL-encoded twice in the path (`a/b` becomes `a%252Fb`); the handlers unescape it once more.
- Create responses carry the new numeric id at the end of the `Location` header.
- Project robots are listed with `q=Level=project,ProjectID=<id>` (capitalised keys, `server/v2.0/handler/robot.go` `ListRobot`); without them only system robots are returned. `RobotQuery` types these keys.
- Robots: create and update require `level` (`system` or `project`) and at least one permission whose `kind` is `system` or `project` (`robot.go` `validate`). Create needs a `duration` of `-1` or a positive number of days, and an absent one reads as `0` and is rejected, so `RobotAPI.extendPayload` sets `-1` when absent; it is not applied on update, where an absent `duration` keeps the current one. Update must repeat the unchanged `name` and `level`, and replaces `description` and `disable`.
- Webhook event types accepted by the server: `PUSH_ARTIFACT`, `PULL_ARTIFACT`, `DELETE_ARTIFACT`, `QUOTA_EXCEED`, `QUOTA_WARNING`, `SCANNING_FAILED`, `SCANNING_STOPPED`, `SCANNING_COMPLETED`, `REPLICATION`, `TAG_RETENTION` (`pkg/notification/notification.go`), mirrored by `ProjectWebhookEventType`. A policy needs at least one event type and one target (`server/v2.0/handler/webhook.go`); `ProjectWebhookPolicyAPI` sends both as given and fills in only `enabled: true` (and a random `name` on create). An update replaces the whole policy.
- A project update applies only `metadata` and `cve_allowlist` (`project.go` `UpdateProject`); metadata keys left out keep their value. Every metadata value is a string (`public: "true"`, swagger `ProjectMetadata`). Create also accepts the top-level boolean `public`, which Harbor copies into `metadata.public`.
- Artifact copy takes the source as the `from` query parameter (`project/repository:tag` or `project/repository@digest`), decoded once like any query value, so it is URL-encoded once.

## Endpoint mapping

| Upstream | This project (`packages/harbor/src/`) |
|---|---|
| `/projects`, `/projects/{project_name_or_id}` | `domains/project/module.ts` |
| `/projects/{project_name}/repositories[/{repository_name}]` | `domains/project-repository/module.ts` |
| `/projects/{project_name}/repositories/{repository_name}/artifacts` | `domains/project-repository-artifact/module.ts` |
| `.../artifacts/{reference}/labels` | `domains/project-repository-artifact-label/module.ts` |
| `/projects/{project_name_or_id}/webhook/policies[/{id}]` | `domains/project-webhook-policy/module.ts` |
| `/robots[/{robot_id}]` | `domains/robot/module.ts` |
| `/search` | `module.ts` `HarborClient.search` |
