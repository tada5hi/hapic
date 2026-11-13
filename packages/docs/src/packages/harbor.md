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
| `client.project` | `ProjectAPI` | `create` · `getMany` · `getOne` · `getAll` · `update` · `delete` |
| `client.projectRepository` | `ProjectRepositoryAPI` | `getMany` · `getOne` · `getAll` · `findOne` · `update` · `delete` |
| `client.projectRepositoryArtifact` | `ProjectRepositoryArtifactAPI` | `getMany` · `copy` · `delete` |
| `client.projectRepositoryArtifactLabel` | `ProjectRepositoryArtifactLabelAPI` | `create` · `delete` |
| `client.projectWebhookPolicy` | `ProjectWebhookPolicyAPI` | `create` · `getMany` · `getOne` · `findOne` · `update` · `delete` · `deleteByName` |
| `client.robot` | `RobotAPI` | `create` · `getMany` · `getOne` · `update` · `updateSecret` · `delete` |

Collection methods (`getMany`) return a `{ data, meta }` shape; `getOne` returns the entity; mutations return the created entity or `void`.

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

// update: Harbor applies only `metadata` and `cve_allowlist`,
// and metadata values are strings
await client.project.update(id, {
    metadata: { public: 'true', auto_scan: 'true' },
});

// delete
await client.project.delete(id);
```

### Repositories & artifacts

```typescript
const repos = await client.projectRepository.getMany({
    projectName: 'team-a',
    query: { page_size: 10 },
});

const artifacts = await client.projectRepositoryArtifact.getMany({
    projectName: 'team-a',
    repositoryName: repos.data[0].name,
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

Harbor requires at least one event type and one target; both are sent as given. `enabled` defaults to `true`. An update replaces the whole policy, so pass every field you want to keep.

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
