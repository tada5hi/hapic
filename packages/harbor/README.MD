# @hapic/harbor 🚢

[![npm version](https://badge.fury.io/js/@hapic%2Fharbor.svg)](https://badge.fury.io/js/@hapic%2Fharbor)
[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This client provides an easy way to interact with various domain endpoints such as repositories, projects, and more.
The Harbor Image Registry is an open-source platform that enables users to store, manage, and distribute container images.
The client offers a variety of abstractions to simplify interaction with the platform and speed up the development process.
Whether you are an experienced developer or new to the world of container images,
this API client is a powerful tool to get the most out of the platform.

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
  - [Project](#project)
  - [ProjectArtifact](#project-artifact)
  - [ProjectArtifactLabel](#project-artifact-label)
  - [ProjectRepository](#project-repository)
  - [ProjectWebhookPolicy](#project-webhook-policy)
  - [RobotAccount](#robot)
- [License](#license)

## Installation

```bash
npm install @hapic/harbor --save
```

## Usage


### Config

To create a configuration for the  `HarborClient`, a configuration must be specified,
like described in the following:

```typescript
import { HarborClient } from '@hapic/harbor';

const client = new HarborClient({
    request: {
        credentials: 'include',
    },
    conenctionOptions: {
        host: 'https://example.com/api/v2.0/',
        user: 'admin',
        password: 'start123'
    },
    // connectionString: 'admin:start123@https://example.com/api/v2.0/'
});
```

### Project

**`GetMany`**

Retrieves a set of projects in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.project.getMany({
    query: {
        // page_size: 10
    }
});
console.log(data);
// { meta: { total: 1 }, data: [ {...}, ... ] }
```

**`GetOne`**

Retrieves details for a specific project in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// get project by id
let data = await harbor.project.getOne(1);

// get project by name
data = await harbor.project.getOne('name', true);
console.log(data);
// { name: 'new-name', ... }
```

**`Create`**

Creates a new project in Harbor with the given name and metadata.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.project.create({
    project_name: 'project-z',
});
console.log(data);
// { name: 'project-z', ... }
```

**`Delete`**

Deletes a specific project in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// delete project by id
await harbor.project.delete(1);

// delete project by name
await harbor.project.delete('name', true);
```

**`Update`**

Updates the metadata for a specific project in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.project.update(1, {
    project_name: 'new-name'
});
```

### Project Artifact

**`GetMany`**

Retrieves a list of all project artifacts in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.projectArtifact.getMany({
    projectName: 'project-z',
    repositoryName: 'repository-x',
    query: {
        // with_tag: true,
        // with_label: true
    }
});
console.log(data);
// [ {...}, ... ]
```

**`Delete`**

Deletes a specific project artifact in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.projectArtifact.delete({
    projectName: 'project-z',
    repositoryName: 'repository-x',
    // tagOrDigest: 'latest'
});
```

**`Copy`**

Copy a specific project repository to another location.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.projectArtifact.copy(
    {
        projectName: 'destination-project',
        repositoryName: 'destination-repository',
    },
    {
        projectName: 'source-project',
        repositoryName: 'source-repository',
    }
);
```

### Project Artifact Label

**`Create`**

Assigns an existing label object to a project in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// assign a label object to a specific project & repo
const data = await harbor.projectArtifactLabel.create({
    labelId: 1,
    projectName: 'project-name',
    repositoryName: 'repository-name',
    // tagOrDigest: 'latest',
});
```

**`Delete`**

Delete an assigned label of a project in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// delete an assigned label of a specific project & repo
const data = await harbor.projectArtifactLabel.delete({
    labelId: 1,
    projectName: 'project-name',
    repositoryName: 'repository-name',
    // tagOrDigest: 'latest'
});
```

### Project Repository

**`GetMany`**

Retrieves a set of project repositories in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const response = await harbor.projectRepository.getMany({
    projectName: 'project-name',
    query: {
        // page_size: 10
    }
});

console.log(response);
// { meta: {total: 1}, data: [{ name: 'xxx', ... }, ... ] }
```

**`GetOne`**

Retrieves a specific project repository in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// find repository by options
let data = await harbor.projectRepository.getOne({
    projectName: 'project-name',
    repositoryName: 'repository-name'
});

// find repository by name
data = await harbor.projectRepository.getOne(
    'project-name/repository-name'
);

console.log(data);
// { name: 'xxx', ... }
```

**`FindOne`**

Finds a specific project repository in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// find repository by options
let data = await harbor.projectRepository.findOne({
    projectName: 'project-name',
    repositoryName: 'repository-name'
});

// find repository by name
data = await harbor.projectRepository.findOne(
    'project-name/repository-name'
);

console.log(data);
// { name: 'xxx', ... } | undefined
```

**`Update`**

Updates a specific registry repository in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.projectRepository.update({
    projectName: 'foo',
    repositoryName: 'bar',
    data: {
        name: 'xxx',
        // ...
    }
});
console.log(data);
// { name: 'xxx', ... }
```

**`Delete`**

Deletes a specific project repository in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// delete repository by options
await harbor.projectRepository.delete({
    projectName: 'project-name',
    repositoryName: 'repository-name'
});

// delete repository by name
await harbor.projectRepository.delete(
    'project-name/repository-name'
);
```

### Project Webhook Policy

**`Create`**

Creates a project webhook policy in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.projectWebhookPolicy.create({
    name: 'webhook',
    // ...
}, {
    projectIdOrName: 1,
    // isProjectName: false
});
```

**`GetMany`**

Retrieves a set of project webhook policies in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const response = await harbor.projectWebhookPolicy.getMany({
    projectIdOrName: 1,
    // isProjectName: false,
    query: {
        q: {
            name: 'webhook'
        }
    }
});
console.log(response);
// { meta: { total: 1 }, data: { { ... } ] }
```

**`GetOne`**

Retrieves a specific project webhook policy in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.projectWebhookPolicy.getOne({
    projectIdOrName: 1,
    // isProjectName: false,
    id: 1
});
console.log(data);
// { name: 'xxx', ... }
```

**`Delete`**

Deletes a specific project webhook policy in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.projectWebhookPolicy.delete({
    projectIdOrName: 1,
    // isProjectName: false,
    id: 1
});
```

### Robot

**`Create`**

Creates a robot in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.robots.create({
    name: 'system',
});
console.log(data);
// { name: 'xxx', ... }
```

**`GetMany`**

Retrieves a set of robots in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const response = await harbor.robots.getMany({
    query: {
        q: {
            name: 'robot'
        }
    }
});
console.log(response);
// { meta: { total: 1 }, data: { { ... } ] }
```

**`GetOne`**

Retrieves a specific robot in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.robots.getOne(1);
console.log(data);
// { name: 'xxx', ... }
```

**`Update`**

Updates a specific robot in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

const data = await harbor.robots.update(1, {
    name: 'system',
    description: 'foo',
    disable: true
});
console.log(data);
// { name: 'xxx', ... }
```

**`UpdateSecret`**

Sets a specific robot secret in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

// optional provie a secret as second argument.
const data = await harbor.robots.updateSecret(1);
console.log(data);
// { secret: 'xxx', ... }
```

**`Delete`**

Deletes a robot in Harbor.
```typescript
import { HarborClient } from '@hapic/harbor';

const harbor = new HarborClient({
    // ...
});

await harbor.robots.delete(1);
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
