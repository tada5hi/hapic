# HAPIC 🌐

[![main](https://github.com/Tada5hi/hapic/actions/workflows/main.yml/badge.svg)](https://github.com/Tada5hi/hapic/actions/workflows/main.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/Tada5hi/hapic/badge.svg)](https://snyk.io/test/github/Tada5hi/hapic)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

## What is it?
"**H**TTP **API** **C**lient" is a tiny & simple fetch based http client.
It provides a convenient way to make HTTP requests.

**Table of Contents**

- [Features](#features)
- [Documentation](#documentation)
- [Packages](#packages)
    - [Base](#base-)
    - [Harbor](#harbor-)
    - [OAuth2](#oauth2-)
    - [Vault](#vault-)
- [License](#license)

## Features

- ✨ Simple API
- 🔄 Transform request payload & headers
- 🛑 Hooks to intercept request and response 
- 🌐 Works in Node.Js, browser & workers environment
- ❌ Throws an error on responses with a non 2xx status code
- 🚀 Method shortcuts for GET, POST, PUT, ...
- ⚙️ Extended options (e.g. baseURL)
- 🎭 Proxy support

## Documentation

To read the docs, visit [https://hapic.tada5hi.net](https://hapic.tada5hi.net)


## Packages
The repository contains the following packages:

### Base 🚀

**`hapic`**

This package contains a HTTP-Client based on fetch.
IT provides a convenient way to make HTTP requests.

The client is extended by the [Harbor](#harbor-), [Vault](#vault-), and [OAuth2](#oauth2-) clients, 
which provide additional functionality specific to those services.

[Documentation](./packages/client)

### Harbor 🚢

**`@hapic/harbor`**

This client provides an easy way to interact with various domain endpoints such as repositories, projects, and more.
The Harbor Image Registry is an open-source platform that enables users to store, manage, and distribute container images. 
The client offers a variety of abstractions to simplify interaction with the platform and speed up the development process.
Whether you are an experienced developer or new to the world of container images,
this API client is a powerful tool to get the most out of the platform.

[Documentation](./packages/harbor)

### OAuth2 🛡️

**`@hapic/oauth2`**

This client provides an easy way to authenticate and authorize **users**, **clients**, **robots**, ...
using OAuth2 and OpenID Connect standards.
With this API client, developers can easily interact with the server's endpoints, 
such as authentication flows, token issuance, and user management. 
The client offers a range of abstractions to simplify interactions with the server 
and speed up the development process. 
Whether you are an experienced developer or new to OAuth2/OpenID,
this API client is a powerful tool to help you implement secure **users**, **clients** & **robots** authentication 
and authorization in your applications.

[Documentation](./packages/oauth2)

### Vault 🔒

**`@hapic/vault`**

This client provides a convenient way to interact with various endpoints in Vault, 
such as secrets, engines, and more. 
Vault is a popular open-source tool used for securely storing and accessing sensitive data, 
such as passwords, API keys, and certificates. 
The client offers a range of abstractions to simplify interactions with Vault and
streamline the development process. 
Whether you are a seasoned developer or new to the world of secrets management, 
this API client is a powerful tool to help you get the most out of Vault.

[Documentation](./packages/vault)

## License

Made with 💚

Published under [MIT License](./LICENSE).
