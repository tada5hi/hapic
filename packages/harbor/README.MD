<p align="center">
    <img src="./assets/logo.svg" alt="@hapic/harbor logo" width="120" />
</p>

<h1 align="center">@hapic/harbor</h1>

<p align="center">
    <b>A typed client for the Harbor container registry API: projects, repositories, artifacts, webhooks and robots.</b><br>
    You pass raw names and plain objects; the client does Harbor's path encoding, <code>q</code> syntax,<br>
    paging headers and payload rules, with types that follow the Harbor v2.16 API.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hapic/harbor"><img src="https://img.shields.io/npm/v/@hapic/harbor" alt="npm version" /></a>
    <a href="https://github.com/tada5hi/hapic/actions/workflows/main.yml"><img src="https://github.com/tada5hi/hapic/actions/workflows/main.yml/badge.svg" alt="CI" /></a>
    <a href="https://github.com/tada5hi/hapic/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
    <a href="https://hapic.tada5hi.net/packages/harbor"><b>Documentation</b></a>
    ·
    <a href="#installation">Installation</a>
    ·
    <a href="#configuration">Configuration</a>
    ·
    <a href="#collection-queries">Collection queries</a>
    ·
    <a href="#api">API</a>
    ·
    <a href="#notes">Notes</a>
</p>

---

## Why @hapic/harbor?

Harbor's REST API has rules that are easy to miss when you call it with `fetch`: a repository name with a `/` has to be URL-encoded twice, the `q` filter is decoded once more than the rest of the query, totals arrive in a header, and new ids only in the `Location` header. Each one turns into a 404, a filter that matches the wrong thing, or a helper you copy from project to project.

`@hapic/harbor` is that layer, written once on top of the [`hapic`](https://www.npmjs.com/package/hapic) HTTP client:

| Concern | Calling the REST API yourself | With `@hapic/harbor` |
|---|---|---|
| **Repository names** | Encode `base/node` twice (`base%252Fnode`); encoding it once returns a 404 | Pass `repositoryName: 'base/node'`; every path segment is encoded for you, the repository name twice |
| **Filtering** | Build `q=name=~foo,tags=v1`, form-encode each `key=value` pair and then the whole string, and prefix a value with `\` when it starts with `~`, `[`, `{` or `(` and must match exactly | Pass `q: { name: '~foo', tags: 'v1' }`; `findOne` matches a name exactly, whatever it starts with |
| **Paging** | Read `X-Total-Count`, then request page after page until one comes back short | `getMany` returns `{ data, meta: { total } }`; `getAll` fetches every page |
| **Projects by name** | Send `X-Is-Resource-Name: true` on every call that takes a project name instead of an id | Pass `isProjectName = true` |
| **Created ids** | Parse the trailing segment of the `Location` response header | `create` returns `{ id }` (or `{ name }` with `resourceNameInLocation`) |
| **Robot accounts** | Send a valid `duration`, repeat the prefixed name and the level on update, copy Harbor's permission lists from its source | `duration` defaults to `-1`, the payload types require `name`, `level` and `permissions`, and two helpers build the full permission lists |
| **Authentication** | Base64-encode `user:password` into a `Basic` header and join every path to `/api/v2.0/` | One connection string: `admin:secret@https://registry.example.com/api/v2.0/` |
| **Response types** | Write them from the swagger | Exported types for every payload and response, following Harbor v2.16 |

The same request, listing every artifact of `team-a/base/node` with its tags, two ways:

```typescript
// with fetch
const auth = Buffer.from('admin:secret').toString('base64');
const repository = encodeURIComponent(encodeURIComponent('base/node'));
const url = `https://registry.example.com/api/v2.0/projects/team-a/repositories/${repository}/artifacts`;

const artifacts: unknown[] = [];
let total = 0;

for (let page = 1; ; page++) {
    const response = await fetch(`${url}?with_tag=true&page_size=50&page=${page}`, {
        headers: { authorization: `Basic ${auth}` },
    });
    if (!response.ok) {
        throw new Error(`Harbor answered ${response.status}`);
    }

    if (page === 1) {
        total = Number(response.headers.get('x-total-count'));
    }

    const items = await response.json() as unknown[];
    artifacts.push(...items);

    if (items.length < 50) {
        break;
    }
}
```

```typescript
// with @hapic/harbor
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    connectionString: 'admin:secret@https://registry.example.com/api/v2.0/',
});

const { data, meta } = await harbor.projectRepositoryArtifact.getAll({
    projectName: 'team-a',
    repositoryName: 'base/node',
    query: { with_tag: true },
});
// data: ProjectArtifact[], meta.total: X-Total-Count of the first page
```

Every domain method turns its arguments into one request the same way: path segments are encoded, the repository name twice, a missing tag becomes `latest`, the query becomes the query string, and options such as `acceptVulnerabilities` become request headers.

<p align="center">
    <img src="./assets/request-path.svg" alt="A call to projectRepositoryArtifact.getOne with projectName team-a, repositoryName base/node, tagOrDigest sha256:9f2c, a query and acceptVulnerabilities becomes one GET request. The project name and the digest are URL-encoded once, the repository name twice (base/node becomes base%252Fnode), a missing tag becomes latest, the query becomes ?with_scan_overview=true and acceptVulnerabilities becomes the X-Accept-Vulnerabilities header. Harbor's router decodes the path once to base%2Fnode and the handler unescapes it again to base/node." width="100%" />
</p>

**Table of Contents**

- [Installation](#installation)
- [Configuration](#configuration)
  - [Connection](#connection)
  - [Instance registry](#instance-registry)
- [Projects](#projects)
- [Repositories](#repositories)
- [Artifacts](#artifacts)
- [Artifact labels](#artifact-labels)
- [Webhook policies](#webhook-policies)
- [Robot accounts](#robot-accounts)
- [Search](#search)
- [Collection queries](#collection-queries)
- [Request headers](#request-headers)
- [Errors](#errors)
- [Testing](#testing)
- [Migrating to v4](#migrating-to-v4)
- [API](#api)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install hapic @hapic/harbor --save
```

- **ESM only**: the package ships `.mjs` with type declarations and has no CommonJS build.
- **Node.js 22 or later** (`engines: >=22.0.0`). It also runs in browsers and workers, as it uses `fetch` through `hapic`.
- **`hapic` is a peer dependency.** Install the `hapic` release published alongside `@hapic/harbor` and upgrade both together: the domain APIs extend `BaseAPI` from `hapic`.

## Configuration

### Connection

```typescript
import { HarborClient } from '@hapic/harbor';

// a connection string: user:password@host
const harbor = new HarborClient({
    connectionString: 'admin:secret@https://registry.example.com/api/v2.0/',
});

// or structured options, plus request options for the underlying hapic client
const other = new HarborClient({
    connectionOptions: {
        host: 'https://registry.example.com/api/v2.0/',
        user: 'admin',
        password: 'secret',
    },
    request: {
        timeout: 10_000,
        credentials: 'include',
    },
});
```

| Option | Type | Description |
|---|---|---|
| `connectionString` | `string` | `user:password@host`. The host becomes the base URL, user and password a `Basic` authorization header |
| `connectionOptions` | `{ host, user, password }` | The same as structured options. Wins over `connectionString`, which is then not parsed |
| `request` | `ClientOptionsInput` from `hapic` | Options of the underlying client: `baseURL`, `headers`, `timeout`, `proxy`, `transport`, transformers and the other `fetch` options |

- **The host is the API root**, including `/api/v2.0/`. `/api/v2.0` is the API path of every Harbor 2.x release, not the product version.
- **A connection string needs exactly one `@` and exactly one `:` before it.** Anything else throws a `ConnectionStringParseError` from the constructor. Use `connectionOptions` when the password contains `@` or `:`.
- **Without either**, the client has no base URL and no authorization header. Set them with `request.baseURL`, `setBaseURL()` and `setAuthorizationHeader()`, or call `harbor.applyConfig({ connectionString })` later.
- `HarborClient` extends the `hapic` `Client`, so hooks, transformers, `setHeader()` and the other client methods apply. See the [hapic client guide](https://hapic.tada5hi.net/guide/client).

### Instance registry

```typescript
import { HarborClient, isClient, setClient, useClient } from '@hapic/harbor';

setClient(new HarborClient({
    connectionString: 'admin:secret@https://registry.example.com/api/v2.0/',
}));

// anywhere else
const harbor = useClient();

// a second, named instance
setClient(new HarborClient({ connectionString: 'robot$ci:token@https://mirror.example.com/api/v2.0/' }), 'mirror');
const mirror = useClient('mirror');

isClient(mirror); // true, also for an instance from another copy of the package
```

| Function | Description |
|---|---|
| `createClient(input?)` | Create a new `HarborClient`. It is not registered |
| `setClient(client, key = 'default')` | Register a client under a key and return it |
| `useClient(key = 'default')` | Return the client registered under the key; create and register one without configuration when there is none |
| `hasClient(key = 'default')` | Whether a client is registered under the key |
| `unsetClient(key = 'default')` | Remove the client registered under the key |
| `isClient(input)` | Whether `input` is a `HarborClient`, checked by a marker instead of `instanceof`, so it also matches an instance from a duplicate copy of the package |

The package's default export is a `HarborClient` created at import time without configuration. It is not the instance `useClient()` returns.

## Projects

The samples in the domain sections use the `harbor` client from [Connection](#connection).

```typescript
const { id } = await harbor.project.create({
    project_name: 'team-a',
    metadata: { public: 'false', auto_scan: 'true' },
});

const taken = await harbor.project.exists('team-a'); // true

const byId = await harbor.project.getOne(id!);
const byName = await harbor.project.getOne('team-a', true);

const { data, meta } = await harbor.project.getMany({
    query: { name: 'team', page_size: 20, sort: ['-creation_time'] },
});

// member counts, quota and, for a proxy cache project, the upstream registry
const summary = await harbor.project.getSummary('team-a', true);

// Harbor applies only `metadata` and `cve_allowlist` on update
await harbor.project.update('team-a', {
    metadata: { public: 'true' },
    cve_allowlist: { items: [{ cve_id: 'CVE-2024-3094' }] },
}, true);

// one metadata key per request
await harbor.project.addMetadata('team-a', 'severity', 'high', true);
await harbor.project.updateMetadata('team-a', 'severity', 'critical', true);
const metadata = await harbor.project.getMetadata('team-a', true);
const severity = await harbor.project.getMetadataItem('team-a', 'severity', true);
await harbor.project.deleteMetadata('team-a', 'severity', true);

await harbor.project.delete('team-a', true);
```

```typescript
// the project name instead of the id in the Location header
const { name } = await harbor.project.create(
    { project_name: 'team-b' },
    { resourceNameInLocation: true },
);
```

- **Id or name.** Every method that takes `id` accepts a number or a name. Pass `true` as the last argument (`isProjectName`) when you pass a name: the client then sends `X-Is-Resource-Name: true`, which makes Harbor read the path parameter as a name.
- **`create`** returns `{ id }`, read from the end of the `Location` header. With `{ resourceNameInLocation: true }` it sends `X-Resource-Name-In-Location: true` and returns `{ name }` instead.
- **`exists(name)`** sends `HEAD /projects?project_name=<name>`. Only a 404 maps to `false`; any other error, such as a 401, is thrown.
- **Metadata values are strings** on the wire: `public: 'true'`, not `true`. `create` also accepts a top-level boolean `public`, which Harbor copies into `metadata.public`.
- **`update`** only applies `metadata` and `cve_allowlist` (`ProjectUpdatePayload` has nothing else). Metadata keys you leave out keep their value.
- **`addMetadata` / `updateMetadata`** send exactly one key, as Harbor requires. `retention_id` cannot be written through them; the `ProjectMetadataWritableName` type excludes it.
- `getMany` takes the project filters `name`, `public`, `owner` and `with_detail` next to `q`, `sort`, `page` and `page_size`. `getAll` takes the same query and fetches every page.

## Repositories

```typescript
const { data: repositories } = await harbor.projectRepository.getMany({
    projectName: 'team-a',
    query: { q: { name: '~node' }, sort: ['-update_time'] },
});
// [{ name: 'team-a/base/node', name_short: 'base/node', project_name: 'team-a', ... }]

// by object, or by the full name: the project is everything before the first /
const repository = await harbor.projectRepository.getOne({ projectName: 'team-a', repositoryName: 'base/node' });
const same = await harbor.projectRepository.getOne('team-a/base/node');

// undefined instead of a 404
const maybe = await harbor.projectRepository.findOne('team-a/base/node');

await harbor.projectRepository.update({
    projectName: 'team-a',
    repositoryName: 'base/node',
    data: { description: 'Node.js base image' },
});

await harbor.projectRepository.delete('team-a/base/node');
```

- **Repository names are passed raw** (`base/node`). The client encodes them twice in the path, as Harbor requires.
- **`getOne`, `getMany` and `getAll`** add `name_short` (the name without the project) and `project_name` to every repository; Harbor's `name` is the full `project/repository` name.
- **`findOne`** matches the full name exactly, also a name that starts with `~`, `[`, `{` or `(`, and resolves to `undefined` when nothing matches. `findOne('team-a/app')` does not return `team-a/app-backend`.
- **The string form** of `getOne`, `findOne` and `delete` splits at the first `/` and throws an `Error` when there is none. A trailing `:tag` or `@digest` is split off and ignored.
- `parseLongProjectRepositoryName('team-a/base/node:1.0')` returns `{ projectName, repositoryName, artifactTag }` (or `artifactDigest` for `@sha256:...`); `buildProjectRepositoryLongName()` does the reverse.

## Artifacts

```typescript
// one page, with tags and the scan overview
const { data: artifacts, meta } = await harbor.projectRepositoryArtifact.getMany({
    projectName: 'team-a',
    repositoryName: 'base/node',
    query: { with_tag: true, with_scan_overview: true, page_size: 10 },
    // sent as X-Accept-Vulnerabilities
    acceptVulnerabilities: 'application/vnd.security.vulnerability.report; version=1.1',
});

// every page
const all = await harbor.projectRepositoryArtifact.getAll({
    projectName: 'team-a',
    repositoryName: 'base/node',
});

// one artifact by tag or digest (latest when absent)
const artifact = await harbor.projectRepositoryArtifact.getOne({
    projectName: 'team-a',
    repositoryName: 'base/node',
    tagOrDigest: 'sha256:9f2c...',
    query: { with_accessory: true, with_sbom_overview: true },
});

// add and remove a tag
await harbor.projectRepositoryArtifact.createTag({
    projectName: 'team-a', repositoryName: 'base/node', tagOrDigest: '1.0', name: 'stable',
});
await harbor.projectRepositoryArtifact.deleteTag({
    projectName: 'team-a', repositoryName: 'base/node', tagOrDigest: '1.0', name: 'stable',
});

// copy into another repository: destination first, then the source
await harbor.projectRepositoryArtifact.copy(
    { projectName: 'team-b', repositoryName: 'base/node' },
    { projectName: 'team-a', repositoryName: 'base/node', artifactTag: '1.0' },
);
await harbor.projectRepositoryArtifact.copy(
    { projectName: 'team-b', repositoryName: 'base/node' },
    'team-a/base/node@sha256:9f2c...',
);

await harbor.projectRepositoryArtifact.delete({
    projectName: 'team-a', repositoryName: 'base/node', tagOrDigest: '1.0',
});
```

- **`tagOrDigest` defaults to `latest`** in `getOne`, `delete`, `createTag` and `deleteTag`. A `delete` without it deletes the artifact tagged `latest`.
- **`getMany` and `getAll`** resolve to `{ data, meta }`. The `with_*` flags (`with_tag`, `with_label`, `with_scan_overview`, `with_sbom_overview`, `with_immutable_status`, `with_accessory`, `with_inherited_accessory`) work on `getMany`, `getAll` and `getOne`.
- **`acceptVulnerabilities`** is a comma-separated list of scan report MIME types, sent as `X-Accept-Vulnerabilities`; Harbor uses the first one it has a report for.
- **`copy(destination, source)`** sends the source as the `from` query parameter. An object source without `artifactTag` or `artifactDigest` copies `latest`; with both, the tag wins. A string source is passed as given (`project/repository:tag` or `project/repository@digest`).
- `createTag` adds the tag `name` to the artifact `tagOrDigest`; `deleteTag` removes the tag `name` from it.

## Artifact labels

```typescript
// attach an existing label (by id) to an artifact
await harbor.projectRepositoryArtifactLabel.create({
    projectName: 'team-a',
    repositoryName: 'base/node',
    tagOrDigest: '1.0',
    labelId: 3,
});

// and detach it
await harbor.projectRepositoryArtifactLabel.delete({
    projectName: 'team-a',
    repositoryName: 'base/node',
    tagOrDigest: '1.0',
    labelId: 3,
});
```

- The label must already exist in Harbor; this package attaches and detaches labels but does not create them.
- `tagOrDigest` defaults to `latest`. Read the labels of an artifact with `projectRepositoryArtifact.getOne({ ..., query: { with_label: true } })`.

## Webhook policies

```typescript
const { id: policyId } = await harbor.projectWebhookPolicy.create({
    projectIdOrName: 'team-a',
    isProjectName: true,
    data: {
        name: 'ci',
        event_types: ['PUSH_ARTIFACT', 'SCANNING_COMPLETED'],
        targets: [{
            type: 'http',
            address: 'https://ci.example.com/hook',
            auth_header: 'Bearer token',
            payload_format: 'CloudEvents',
        }],
    },
});

const { data: policies } = await harbor.projectWebhookPolicy.getMany({ projectIdOrName: 1 });
const policy = await harbor.projectWebhookPolicy.getOne({ projectIdOrName: 1, id: policyId! });
const byName = await harbor.projectWebhookPolicy.findOne({ projectIdOrName: 1, name: 'ci' });

// an update replaces the whole policy: pass every field you want to keep
await harbor.projectWebhookPolicy.update({
    projectIdOrName: 1,
    id: policyId!,
    data: {
        name: 'ci',
        enabled: false,
        event_types: ['PUSH_ARTIFACT'],
        targets: policy.targets,
    },
});

await harbor.projectWebhookPolicy.deleteByName({ projectIdOrName: 1, name: 'ci' });
// or: await harbor.projectWebhookPolicy.delete({ projectIdOrName: 1, id: policyId! });
```

```typescript
// what Harbor supports
const events = await harbor.projectWebhookPolicy.getSupportedEvents({ projectIdOrName: 1 });
// { event_type: [...], notify_type: ['http', 'slack'], payload_formats: [...] }

// deliveries of a policy, their tasks and a task log
const { data: executions } = await harbor.projectWebhookPolicy.getExecutions({
    projectIdOrName: 1,
    id: policyId!,
    query: { sort: ['-id'], page_size: 10 },
});
const { data: tasks } = await harbor.projectWebhookPolicy.getExecutionTasks({
    projectIdOrName: 1,
    id: policyId!,
    executionId: executions[0].id!,
});
const log = await harbor.projectWebhookPolicy.getExecutionTaskLog({
    projectIdOrName: 1,
    id: policyId!,
    executionId: executions[0].id!,
    taskId: tasks[0].id!,
});

// last trigger time per policy and event type (deprecated by Harbor)
const triggers = await harbor.projectWebhookPolicy.getLastTriggers({ projectIdOrName: 1 });
```

- **`event_types` and `targets` are required** (at least one of each); Harbor answers 400 without them. Both are sent as given.
- **Filled in when absent:** `enabled: true` on create and on update, and a random `name` on create. An update without `enabled` therefore enables a disabled policy.
- **An update replaces the whole policy**, so pass its current `name`, `event_types` and `targets` along with the change.
- **Event types** (`ProjectWebhookEventType`): `PUSH_ARTIFACT`, `PULL_ARTIFACT`, `DELETE_ARTIFACT`, `QUOTA_EXCEED`, `QUOTA_WARNING`, `SCANNING_FAILED`, `SCANNING_STOPPED`, `SCANNING_COMPLETED`, `REPLICATION`, `TAG_RETENTION`.
- **Targets** are of type `http` or `slack`. An `http` target takes a `payload_format` of `Default` (Harbor's default) or `CloudEvents`; a `slack` target takes none. Harbor leaves `skip_cert_verify` out of a response when it is `false`.
- **`findOne` and `deleteByName`** match the name exactly, also a name starting with `~`, `[`, `{` or `(`. `findOne` resolves to `undefined` and `deleteByName` does nothing when no policy matches.
- **`projectIdOrName`** takes the project id, or its name together with `isProjectName: true` (sent as `X-Is-Resource-Name`).
- `create` returns `{ id }` from the `Location` header. `getExecutions` and `getExecutionTasks` resolve to `{ data, meta }`; `getExecutionTaskLog` resolves to the log as plain text (an empty string when there is none).

## Robot accounts

```typescript
import { buildRobotPermissionForAllResources } from '@hapic/harbor';

const robot = await harbor.robot.create({
    name: 'ci',
    description: 'CI pipeline',
    level: 'project',
    permissions: [{
        kind: 'project',
        namespace: 'team-a',
        access: [
            { resource: 'repository', action: 'pull' },
            { resource: 'repository', action: 'push' },
        ],
    }],
    // duration: -1 (never expires) when absent
});
// robot.id, robot.secret and robot.name ('robot$team-a+ci') come from Harbor

// the robots of a project (capitalised keys, as Harbor expects)
const { data: robots } = await harbor.robot.getMany({
    query: { q: { Level: 'project', ProjectID: 1 } },
});

// update: name exactly as Harbor returns it, the same level, at least one permission
const current = await harbor.robot.getOne(robot.id);
await harbor.robot.update(robot.id, {
    name: current.name,
    level: 'project',
    permissions: [buildRobotPermissionForAllResources('team-a')],
    description: 'CI pipeline (full access)',
    disable: false,
});

// rotate the secret: Harbor generates one, or pass your own as second argument
const { secret } = await harbor.robot.updateSecret(robot.id);

await harbor.robot.delete(robot.id);
```

```typescript
import {
    RobotPermissionAction,
    RobotPermissionResource,
    buildRobotPermissionForAllSystemResources,
} from '@hapic/harbor';

const system = await harbor.robot.create({
    name: 'ops',
    level: 'system',
    permissions: [
        buildRobotPermissionForAllSystemResources(),
        {
            kind: 'project',
            namespace: '*',
            access: [{ resource: RobotPermissionResource.REPOSITORY, action: RobotPermissionAction.PULL }],
        },
    ],
});
```

- **`level` and `permissions` are required** on create and update. Harbor rejects a robot without a level and without at least one permission whose `kind` is `system` or `project`.
- **`duration`** is set to `-1` (never expires) when absent on create, since Harbor rejects a missing one there. On update it is not filled in: an update without `duration` keeps the current expiry.
- **Update needs the name exactly as Harbor returns it**, with its prefix: `robot$<name>` for a system robot, `robot$<project>+<name>` for a project robot. The name you used at create is rejected, and so is a changed `level`. Update replaces `description` and `disable`, so pass them again.
- **`create`** resolves to Harbor's response (`id`, full `name`, `secret`, `expires_at`, `creation_time`) merged over your payload. The secret is only returned here and by `updateSecret`.
- **`getMany`** without `Level` lists system robots only; pass `q: { Level: 'project', ProjectID: <id> }` for the robots of a project.
- **Permission helpers:** `buildRobotPermissionForAllResources(namespace)` grants every project-scope robot policy Harbor v2.16 lists (`PoliciesMap[ScopeProject]`) for a project name or `*`; `buildRobotPermissionForAllSystemResources()` grants every system-scope one with namespace `/`. Harbor also accepts robot, member and export-cve policies for project robots and robot, user, ldap-user, user-group and quota update for system robots; the helpers leave those out.
- `RobotPermissionResource` and `RobotPermissionAction` enumerate the resources and actions of Harbor v2.16. An access entry without `effect` reads as `allow`; pass `effect: 'deny'` to exclude an action.

## Search

```typescript
const { project, repository } = await harbor.search('node');
// project: Project[], repository: [{ repository_name: 'team-a/base/node', project_name: 'team-a', ... }]
```

`search(term)` sends `GET /search?q=<term>` and resolves to the matching projects and repositories. Pass the term raw; the client encodes it.

## Collection queries

Every `query` option of a list method takes the same collection fields, typed by the resource:

```typescript
const { data, meta } = await harbor.projectRepositoryArtifact.getMany({
    projectName: 'team-a',
    repositoryName: 'base/node',
    query: {
        q: { digest: 'sha256:9f2c...' },
        sort: ['-push_time'],
        page: 2,
        page_size: 25,
    },
});

meta.total; // the X-Total-Count header, when Harbor sends it
```

| Field | Type | Sent as |
|---|---|---|
| `q` | object, keys of the resource | `q=key=value,key=value`, each pair form-encoded and the whole string encoded again, as Harbor decodes it twice |
| `sort` | `('field' \| '-field')[]` | `sort=field,-field`; a `-` sorts descending |
| `page` | `number` | `page`, starting at 1 |
| `page_size` | `number` | `page_size`; Harbor caps it at 100 |

- **`q` values are matched by Harbor**: `value` exactly, `~value` as a substring, and a value starting with `[`, `{` or `(` as a range or list. Several keys must all match.
- **Pass values raw.** Do not encode them yourself; the client does, and a pre-encoded value is encoded again.
- **`getAll`** (projects, repositories, artifacts) requests page after page with `page_size` 50 unless you set one, starting at your `page` or 1, until a page returns fewer items than `page_size`. It resolves to all items and the `meta` of the first page, and does not modify your query.
- **Robots** use Harbor's capitalised `Level` and `ProjectID` keys in `q`, typed by `RobotQuery`.

## Request headers

| Header | How it is set |
|---|---|
| `Authorization` | From `connectionString` / `connectionOptions` (`Basic`), or `setAuthorizationHeader()` |
| `X-Is-Resource-Name` | The `isProjectName` argument of project and webhook policy methods |
| `X-Accept-Vulnerabilities` | The `acceptVulnerabilities` option of `projectRepositoryArtifact.getMany`, `getAll` and `getOne` |
| `X-Resource-Name-In-Location` | The `resourceNameInLocation` option of `project.create` |
| `X-Request-Id` | Not a method argument: set it per client or per request, as below |

```typescript
import { HookName } from 'hapic';
import { HeaderName } from '@hapic/harbor';

// every request of this client
harbor.setHeader(HeaderName.REQUEST_ID, 'deploy-42');

// a fresh id per request
harbor.on(HookName.REQUEST, (options) => {
    (options.headers as Headers).set(HeaderName.REQUEST_ID, crypto.randomUUID());
    return options;
});
```

`HeaderName` holds the header names this package reads or sends: `LOCATION`, `IS_RESOURCE_NAME`, `TOTAL_COUNT`, `ACCEPT_VULNERABILITIES`, `RESOURCE_NAME_IN_LOCATION` and `REQUEST_ID`.

## Errors

```typescript
import {
    isClientErrorWithStatusCode,
    isConnectionStringParseError,
    isHttpResponseError,
    isNetworkError,
} from '@hapic/harbor';

try {
    await harbor.project.getOne('team-z', true);
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        // no such project
    } else if (isHttpResponseError(error)) {
        console.error(error.status, error.response?.data); // Harbor's error body
    } else if (isNetworkError(error)) {
        console.error(error.code); // e.g. ETIMEDOUT after request.timeout
    }
}
```

- **A 4xx or 5xx response** throws an `HttpResponseError` with `status` and the decoded `response`. **A dispatch failure** (connection refused, timeout, abort) throws a `NetworkError` with a `code`. Both are `ClientError`s, and every error a hapic package throws is a `HapicError`.
- **A malformed connection string** throws a `ConnectionStringParseError` from the `HarborClient` constructor (`isConnectionStringParseError`).
- **Not every miss throws:** `project.exists` resolves to `false` on a 404, `projectRepository.findOne` and `projectWebhookPolicy.findOne` resolve to `undefined`, and `deleteByName` does nothing when there is no match.
- The guards (`isHapicError`, `isClientError`, `isNetworkError`, `isHttpResponseError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue`) are re-exported from `hapic` and work across duplicate package copies. An error hook can recover from an error or retry the request; see [hapic errors](https://hapic.tada5hi.net/guide/errors) and [hooks](https://hapic.tada5hi.net/guide/hooks).

## Testing

```typescript
import { MemoryTransport } from 'hapic';
import { HarborClient } from '@hapic/harbor';

const transport = new MemoryTransport({
    fetch: () => ({
        status: 200,
        headers: { 'content-type': 'application/json', 'x-total-count': '0' },
        body: [],
    }),
});

const client = new HarborClient({ request: { transport } });
await client.projectRepository.getMany({ projectName: 'team-a' });

transport.requests[0].url; // 'projects/team-a/repositories'
```

Pass a `MemoryTransport` from `hapic` as `request.transport` to test code that uses the client without a Harbor instance: it records every request and answers with what `fetch` returns. See [hapic testing](https://hapic.tada5hi.net/guide/testing).

## Migrating to v4

v4 aligns the types and endpoints with the Harbor v2.16 API. The changes you are most likely to hit:

- **Encoding:** pass raw values (`base/node`, `sha256:...`) everywhere and stop pre-encoding them; several `q` keys are joined with `,` instead of `&`.
- **Webhook policies:** `event_types` and `targets` are required and no longer defaulted; `update` no longer generates a `name`.
- **Robots:** `level` and `permissions` are required, `update` needs the name as Harbor returns it, and project robots are listed with `q: { Level, ProjectID }`.
- **Projects:** metadata flags are the strings `'true'` / `'false'`, and `ProjectUpdatePayload` only has `metadata` and `cve_allowlist`.
- **Artifacts:** `getMany` resolves to `{ data, meta }` instead of an array.

The full list, with what to change for each item, is in the [v4 migration notes](https://hapic.tada5hi.net/packages/harbor#migrating-to-v4).

## API

`HarborClient` composes one domain API per Harbor resource. Each class also works on its own: `new ProjectAPI({ client })` takes a `HarborClient` (or any `hapic` client) or plain `hapic` request options.

| Property | Class | Methods |
|---|---|---|
| `harbor.project` | `ProjectAPI` | `create`, `exists`, `getMany`, `getAll`, `getOne`, `getSummary`, `update`, `delete`, `getMetadata`, `getMetadataItem`, `addMetadata`, `updateMetadata`, `deleteMetadata` |
| `harbor.projectRepository` | `ProjectRepositoryAPI` | `getMany`, `getAll`, `getOne`, `findOne`, `update`, `delete` |
| `harbor.projectRepositoryArtifact` | `ProjectRepositoryArtifactAPI` | `getMany`, `getAll`, `getOne`, `copy`, `delete`, `createTag`, `deleteTag` |
| `harbor.projectRepositoryArtifactLabel` | `ProjectRepositoryArtifactLabelAPI` | `create`, `delete` |
| `harbor.projectWebhookPolicy` | `ProjectWebhookPolicyAPI` | `create`, `getMany`, `getOne`, `findOne`, `update`, `delete`, `deleteByName`, `getSupportedEvents`, `getLastTriggers`, `getExecutions`, `getExecutionTasks`, `getExecutionTaskLog` |
| `harbor.robot` | `RobotAPI` | `create`, `getMany`, `getOne`, `update`, `updateSecret`, `delete` |
| `harbor` | `HarborClient` | `search`, `applyConfig`, and every `hapic` `Client` method |

Collection methods resolve to `{ data, meta: { total? } }`. `project.create` and `projectWebhookPolicy.create` resolve to `{ id }` (`project.create` with `resourceNameInLocation`: `{ name }`), `robot.create` to the created robot, `updateSecret` to `{ secret }`, the `get*` methods to the entity, and the other mutations to `void`.

Other exports:

| Export | Kind | Purpose |
|---|---|---|
| `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` | functions | The [instance registry](#instance-registry) |
| `HARBOR_CLIENT_INSTANCE` | symbol | The marker `isClient` checks |
| `buildRobotPermissionForAllResources`, `buildRobotPermissionForAllSystemResources` | functions | Full project-scope or system-scope robot permissions |
| `RobotPermissionResource`, `RobotPermissionAction` | enums | Robot permission resources and actions of Harbor v2.16 |
| `HeaderName` | enum | Header names this package reads or sends |
| `parseLongProjectRepositoryName`, `buildProjectRepositoryLongName` | functions | Split or build `project/repository[:tag \| @digest]` |
| `parseConnectionString` | function | Parse `user:password@host` into `{ host, user, password }` |
| `buildQueryString` | function | Serialize a collection query the way Harbor expects |
| `extractResourceIDOfResponse`, `extractResourceNameOfResponse`, `extractResourceMetaOfResponse` | functions | Read the new id or name from `Location`, or the total from `X-Total-Count` |
| `ConnectionStringParseError`, `isConnectionStringParseError`, `CONNECTION_STRING_PARSE_ERROR_INSTANCE` | class, guard, symbol | The connection string error, re-exported from `hapic` |
| `isHapicError`, `isClientError`, `isNetworkError`, `isHttpResponseError`, `isClientErrorWithStatusCode`, `isClientErrorDueNetworkIssue` | guards | Error guards, re-exported from `hapic` |
| `Project`, `ProjectRepository`, `ProjectArtifact`, `ProjectWebhookPolicy`, `Robot`, `SearchResult`, ... | types | Payload, response and context types of every method, following Harbor v2.16 |
| `Config`, `ConfigInput`, `ConnectionOptions` | types | Constructor options |

## Notes

- **Values are passed raw and encoded by the client.** Repository names, tags, digests, the `copy` source, `search` terms and `q` values: an already encoded value is encoded again and no longer matches.
- **A `,` inside a `q` value cannot be expressed.** Harbor splits `q` on `,` after decoding it, so a value containing a comma is cut in two.
- **`tagOrDigest` defaults to `latest`.** `projectRepositoryArtifact.delete({ projectName, repositoryName })` deletes the artifact tagged `latest`, not the repository; use `projectRepository.delete` for that.
- **Updates replace, they do not merge,** for webhook policies (the whole policy) and robots (`description`, `disable`, `permissions`). Project updates are the exception: metadata keys you leave out keep their value.
- **A webhook policy update without `enabled` enables the policy**, because the client fills in `enabled: true`.
- **`getAll` stops at the first short page** and keeps the `meta.total` of the first page; items added or removed while it pages can be missed or returned twice.
- **`useClient()` without a prior `setClient()`** returns a client without base URL or credentials, as does the default export.

## Contributing

`@hapic/harbor` lives in the [hapic monorepo](https://github.com/tada5hi/hapic) under `packages/harbor`.
Report bugs and propose changes in its [issue tracker](https://github.com/tada5hi/hapic/issues); commits follow
[Conventional Commits](https://www.conventionalcommits.org/), which drive the releases.

## License

Made with 💚

Published under [MIT License](https://github.com/tada5hi/hapic/blob/master/LICENSE).
