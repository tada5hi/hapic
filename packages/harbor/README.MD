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
  - [ProjectWebhook](#project-webhook)
  - [RobotAccount](#robot-account)
- [License](#license)

## Installation

```bash
npm install @hapic/harbor --save
```

## Usage

### Project

**`Create`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.project.create({
    project_name: 'project-z',
});
console.log(data);
// { name: 'project-z', ... }
```

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

// delete project by id
await harbor.project.delete(1);

// delete project by name
await harbor.project.delete('name', true);
```

**`Update`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.project.update(1, {
    project_name: 'new-name'
});
```

**`GetMany`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.project.getMany();
console.log(data);
// [ { name: 'new-name', ... }, {...}, ... ]
```

**`GetOne`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

// get project by id
let data = await harbor.project.getOne(1);

// get project by name
data = await harbor.project.getOne('name', true);
console.log(data);
// { name: 'new-name', ... }
```

**`Save`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.project.save({
    project_name: 'new-name'
});
```

### Project Artifact

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.projectArtifact.delete({
    projectName: 'project-z',
    repositoryName: 'repository-x',
    // tagOrDigest: 'latest'
});
```

**`GetMany`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.project.getMany({
    projectName: 'project-z',
    repositoryName: 'repository-x',
    // withTag: true,
    // withLabel: true
});
console.log(data);
// [ {...}, ... ]
```

**`Copy`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
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
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

// assign a label object to a specific project & repo
const data = await harbor.robotAccount.create({
    id: 1,
    name: 'label',
    scope: 'xxx',
    // ...
}, {
    projectName: 'project-name',
    repositoryName: 'repository-name',
    // tagOrDigest: 'latest'
});
```

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

// delete an assigned label of a specific project & repo
const data = await harbor.robotAccount.delete(1, {
    projectName: 'project-name',
    repositoryName: 'repository-name',
    // tagOrDigest: 'latest'
});
```

### Project Repository

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
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

**`FindOne`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
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
// { name: 'xxx', ... }
```

**`GetOne`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
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

**`Update`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.projectRepository.update(
    'project-name/repository-name',
    {
        name: 'xxx',
        // ...
    }
);
console.log(data);
// { name: 'xxx', ... }
```

### Project Webhook

**`Create`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.projectWebHook.create({
    name: 'webhook',
    // ...
}, {
    projectIdOrName: 1,
    // isProjectName: false
});
```

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.projectWebHook.delete({
    projectIdOrName: 1,
    // isProjectName: false,
    name: 'webhook'
});
```

**`FindOne`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.projectWebHook.findOne({
    projectIdOrName: 1,
    // isProjectName: false,
    name: 'webhook'
});
console.log(data);
// { name: 'xxx', ... }
```

### Robot Account

**`Create`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.robotAccount.create({
    name: 'system',
});
console.log(data);
// { name: 'xxx', ... }
```

**`Delete`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

await harbor.robotAccount.delete(1);
```

**`FindOne`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.robotAccount.findOne({
    name: 'system'
});
console.log(data);
// { name: 'xxx', ... }
```

**`Update`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

const data = await harbor.robotAccount.update(1, {
    name: 'system',
    description: 'foo',
    disable: true
});
console.log(data);
// { name: 'xxx', ... }
```

**`UpdateSecret`**
```typescript
import { Client } from '@hapic/harbor';

const harbor = new Client({
    // ...
});

// optional provie a secret as second argument.
const data = await harbor.robotAccount.updateSecret(1);
console.log(data);
// { secret: 'xxx', ... }
```

## License

Made with 💚

Published under [MIT License](./LICENSE).
