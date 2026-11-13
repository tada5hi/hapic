# @hapic/harbor

A typed client for the [Harbor](https://goharbor.io/) container registry API — projects, repositories, artifacts, robot accounts, and webhook policies. It extends the base [`Client`](/guide/client), so everything in the guide (hooks, transformers, errors, instance registry) applies.

## Installation

```bash
npm install hapic @hapic/harbor --save
```

## Creating a client

`HarborClient` is configured with a `connectionString` or structured `connectionOptions`. The connection string follows the format **`user:password@host`** and is mapped to a `baseURL` plus a `Basic` authorization header.

```typescript
import { HarborClient } from '@hapic/harbor';

const client = new HarborClient({
    connectionString: 'admin:start123@https://registry.example.com/api/v2.0/',
});
```

Or with structured options:

```typescript
const client = new HarborClient({
    connectionOptions: {
        host: 'https://registry.example.com/api/v2.0/',
        user: 'admin',
        password: 'start123',
    },
    request: {
        credentials: 'include',
    },
});
```

The package also exports the standard registry — `createClient`, `useClient`, `setClient`, `hasClient`, `unsetClient`, `isClient` — see [Instance Registry](/guide/instance).

## Domain APIs

| Property | Class | Key methods |
|----------|-------|-------------|
| `client.project` | `ProjectAPI` | `create` · `exists` · `getMany` · `getOne` · `getAll` · `getSummary` · `update` · `delete` · `getMetadata` · `getMetadataItem` · `addMetadata` · `updateMetadata` · `deleteMetadata` |
| `client.projectRepository` | `ProjectRepositoryAPI` | `getMany` · `getOne` · `getAll` · `findOne` · `update` · `delete` |
| `client.projectRepositoryArtifact` | `ProjectRepositoryArtifactAPI` | `getMany` · `getAll` · `getOne` · `copy` · `delete` · `createTag` · `deleteTag` |
| `client.projectRepositoryArtifactLabel` | `ProjectRepositoryArtifactLabelAPI` | `create` · `delete` |
| `client.projectWebhookPolicy` | `ProjectWebhookPolicyAPI` | `create` · `getMany` · `getOne` · `findOne` · `update` · `delete` · `deleteByName` · `getSupportedEvents` · `getExecutions` · `getExecutionTasks` · `getExecutionTaskLog` · `getLastTriggers` |
| `client.robot` | `RobotAPI` | `create` · `getMany` · `getOne` · `update` · `updateSecret` · `delete` |

Collection methods (`getMany`, `getAll`, `getExecutions`, …) return a `{ data, meta }` shape, where `meta.total` is Harbor's `X-Total-Count`; `getAll` fetches page after page until a page comes back short. `getOne` returns the entity; mutations return the created entity or `void`.

The types follow the Harbor **v2.16** API.

## Examples

### Projects

```typescript
// create
const { id } = await client.project.create({ project_name: 'team-a' });

// read one (by id, or by name with the isProjectName flag)
const project = await client.project.getOne(id);

// list with pagination
const { data, meta } = await client.project.getMany({
    query: { page: 1, page_size: 20 },
});

// existence check: only a 404 maps to false, other errors are thrown
const taken = await client.project.exists('team-a');

// member counts, quota and (for a proxy cache project) the upstream registry
const summary = await client.project.getSummary('team-a', true);

// update: Harbor applies only `metadata` and `cve_allowlist`,
// and metadata values are strings
await client.project.update(id, {
    metadata: { public: 'true', auto_scan: 'true' },
});

// one metadata key at a time
await client.project.addMetadata(id, 'auto_scan', 'true');
await client.project.updateMetadata(id, 'severity', 'high');
await client.project.deleteMetadata(id, 'auto_scan');
const metadata = await client.project.getMetadata(id);

// delete
await client.project.delete(id);
```

With `{ resourceNameInLocation: true }`, `create` sends `X-Resource-Name-In-Location: true` and returns the project `name` instead of the `id`:

```typescript
const { name } = await client.project.create(
    { project_name: 'team-a' },
    { resourceNameInLocation: true },
);
```

### Repositories & artifacts

```typescript
const repos = await client.projectRepository.getMany({
    projectName: 'team-a',
    query: { page_size: 10 },
});

const { data: artifacts, meta } = await client.projectRepositoryArtifact.getMany({
    projectName: 'team-a',
    repositoryName: 'app',
    query: { with_tag: true, with_scan_overview: true },
    // sent as X-Accept-Vulnerabilities
    acceptVulnerabilities: 'application/vnd.security.vulnerability.report; version=1.1',
});

// one artifact by tag or digest (default: latest)
const artifact = await client.projectRepositoryArtifact.getOne({
    projectName: 'team-a',
    repositoryName: 'app',
    tagOrDigest: 'sha256:…',
    query: { with_accessory: true },
});

// add or remove a tag of an artifact
await client.projectRepositoryArtifact.createTag({
    projectName: 'team-a', repositoryName: 'app', tagOrDigest: 'v1', name: 'stable',
});
await client.projectRepositoryArtifact.deleteTag({
    projectName: 'team-a', repositoryName: 'app', tagOrDigest: 'v1', name: 'stable',
});

// copy an artifact into another repository
await client.projectRepositoryArtifact.copy(
    { projectName: 'team-b', repositoryName: 'app' },
    { projectName: 'team-a', repositoryName: 'app', artifactTag: 'latest' },
);
```

### Robot accounts

```typescript
const robot = await client.robot.create({
    name: 'ci',
    description: 'CI/CD automation',
    level: 'project',
    permissions: [{
        kind: 'project',
        namespace: 'team-a',
        access: [{ resource: 'repository', action: 'pull' }],
    }],
    // duration defaults to -1 (never expires)
});
// robot.secret is the generated credential

// every project-scope robot policy Harbor lists (exported by '@hapic/harbor';
// buildRobotPermissionForAllSystemResources() for a system robot)
const permission = buildRobotPermissionForAllResources('team-a');

// list the robots of a project (Harbor's `q` keys are capitalised)
const { data: robots } = await client.robot.getMany({
    query: { q: { Level: 'project', ProjectID: 1 } },
});

// rotate the secret
const { secret } = await client.robot.updateSecret(robot.id);

await client.robot.delete(robot.id);
```

### Webhook policies

```typescript
await client.projectWebhookPolicy.create({
    projectIdOrName: 'team-a',
    isProjectName: true,
    data: {
        name: 'ci',
        event_types: ['PUSH_ARTIFACT', 'SCANNING_COMPLETED'],
        targets: [{ type: 'http', address: 'https://ci.example.com/hook', skip_cert_verify: false }],
    },
});
```

Harbor requires at least one event type and one target; both are sent as given. `enabled` defaults to `true`. An update replaces the whole policy, so pass every field you want to keep. A target is of type `http` or `slack`; an `http` target takes a `payload_format` of `Default` (Harbor's default) or `CloudEvents`.

```typescript
const events = await client.projectWebhookPolicy.getSupportedEvents({ projectIdOrName: 1 });

const { data: executions } = await client.projectWebhookPolicy.getExecutions({
    projectIdOrName: 1,
    id: policyId,
    query: { sort: ['-id'], page_size: 10 },
});
const { data: tasks } = await client.projectWebhookPolicy.getExecutionTasks({
    projectIdOrName: 1,
    id: policyId,
    executionId: executions[0].id,
});
const log = await client.projectWebhookPolicy.getExecutionTaskLog({
    projectIdOrName: 1,
    id: policyId,
    executionId: executions[0].id,
    taskId: tasks[0].id,
});
```

## Request headers

| Header | How to set it |
|--------|---------------|
| `X-Is-Resource-Name` | the `isProjectName` argument of project and webhook policy methods |
| `X-Accept-Vulnerabilities` | the `acceptVulnerabilities` option of `projectRepositoryArtifact.getMany` / `getOne` |
| `X-Resource-Name-In-Location` | the `resourceNameInLocation` option of `project.create` |
| `X-Request-Id` | not a method argument: set it per client or per request (below) |

```typescript
import { HeaderName } from '@hapic/harbor';

// every request of this client
client.setHeader(HeaderName.REQUEST_ID, 'deploy-42');

// a fresh id per request
client.on('request', (options) => {
    options.headers.set(HeaderName.REQUEST_ID, crypto.randomUUID());
    return options;
});
```

## Migrating to v4

- `projectRepositoryArtifact.getMany` resolves to `{ data, meta }` instead of the artifact array: read `.data`.
- `ProjectArtifactTag.signed` and the `with_signature` query parameter are removed (Harbor dropped Notary).
- `ProjectCreatePayload.registry_id` is a number (or `null`); a string is no longer accepted.
- `buildRobotPermissionForAllResources` grants every project-scope robot policy of Harbor v2.16 (it now includes `accessory`, `artifact-addition`, `quota`, `sbom`, `scanner` and `tag-retention`).

## Error handling

Harbor errors come back as the base [`ClientError`](/guide/errors). The package re-exports the guards from `hapic`:

```typescript
import { isClientErrorWithStatusCode } from '@hapic/harbor';

try {
    await client.project.getOne(404);
} catch (error) {
    if (isClientErrorWithStatusCode(error, 404)) {
        // no such project
    }
}
```
