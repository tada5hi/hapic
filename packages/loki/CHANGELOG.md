# Changelog

## [2.0.0](https://github.com/tada5hi/hapic/compare/loki-v1.2.2...loki-v2.0.0) (2026-06-20)


### ⚠ BREAKING CHANGES

* packages are ESM-only (no CommonJS build); require() is no longer supported and the minimum supported Node.js version is 22.
* **client:** cross-realm identity moved from a single `@instanceof` symbol to a non-writable `symbol[]` marker chain.
    - Subclasses must register identity with `markInstanceof(this, Symbol.for(...))`
      in the constructor; a `readonly '@instanceof' = Symbol.for(...)` class field now
      throws `TypeError: Cannot redefine property: @instanceof`.
    - `error.code` is always a string (`'HTTP_RESPONSE_ERROR'` for HTTP errors,
      previously `undefined`); `error.name` is the subclass name.
    - Marker `Symbol.for(...)` keys are now namespaced.

### Features

* **client:** consolidate singleton instance registry into createClientRegistry factory ([#1039](https://github.com/tada5hi/hapic/issues/1039)) ([b7b094f](https://github.com/tada5hi/hapic/commit/b7b094f0413c04ceccc73c5b575fe605a1d118f4))
* **client:** injectable transport seam + MemoryTransport test double ([#1028](https://github.com/tada5hi/hapic/issues/1028)) ([7c2b466](https://github.com/tada5hi/hapic/commit/7c2b466998f8a122426c767e97e052c14dbe911a))
* **client:** introduce IClient interface as the client type reference ([#1040](https://github.com/tada5hi/hapic/issues/1040)) ([2363c13](https://github.com/tada5hi/hapic/commit/2363c139f647d97227f73a19a1844922a8aacbef))
* **client:** rebuild error handling on @ebec/core with marker-chain instanceof ([#1029](https://github.com/tada5hi/hapic/issues/1029)) ([9fb3099](https://github.com/tada5hi/hapic/commit/9fb3099fc5478b751032d468072e46dc9d37d929))
* modernize toolchain to eslint v10, tsdown & vitest ([#1041](https://github.com/tada5hi/hapic/issues/1041)) ([eddcfb6](https://github.com/tada5hi/hapic/commit/eddcfb66aeece17f1dcd76212d7a9fe7553b1ebe))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.8.2 to ^3.0.0
  * peerDependencies
    * hapic bumped from ^2.8.2 to ^3.0.0

## [1.2.2](https://github.com/tada5hi/hapic/compare/loki-v1.2.1...loki-v1.2.2) (2026-02-25)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.8.1 to ^2.8.2
  * peerDependencies
    * hapic bumped from ^2.8.1 to ^2.8.2

## [1.2.1](https://github.com/tada5hi/hapic/compare/loki-v1.2.0...loki-v1.2.1) (2026-01-05)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.8.0 to ^2.8.1
  * peerDependencies
    * hapic bumped from ^2.8.0 to ^2.8.1

## [1.2.0](https://github.com/tada5hi/hapic/compare/loki-v1.1.0...loki-v1.2.0) (2025-07-22)


### Features

* add default labels ([c24bb29](https://github.com/tada5hi/hapic/commit/c24bb29092fb31ec07696bd64f4ad4c3987ae64b))


### Bug Fixes

* querier query result typing ([73892da](https://github.com/tada5hi/hapic/commit/73892da3d5c7285f8f46e19b75d08364c5304c16))

## [1.1.0](https://github.com/tada5hi/hapic/compare/loki-v1.0.0...loki-v1.1.0) (2025-06-30)


### Features

* add bigint support for query parameters ([#938](https://github.com/tada5hi/hapic/issues/938)) ([3b4325f](https://github.com/tada5hi/hapic/commit/3b4325f0871326de87855405d3513dae766abd34))
* initial compactor api implementation ([073bc06](https://github.com/tada5hi/hapic/commit/073bc06b7b92b29a611cc62022cd89a3e1181893))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.7.0 to ^2.8.0
  * peerDependencies
    * hapic bumped from ^2.7.0 to ^2.8.0

## 1.0.0 (2025-06-26)


### Features

* enhance error handling & fixed error suites ([#936](https://github.com/tada5hi/hapic/issues/936)) ([95151d5](https://github.com/tada5hi/hapic/commit/95151d5fcf749849ca80ec1838724c23ef690e54))
* initial loki client ([#933](https://github.com/tada5hi/hapic/issues/933)) ([52bfe18](https://github.com/tada5hi/hapic/commit/52bfe186c1547ef42f52f3e2c9ab69cacda1dc6c))
* rename distributor api methods ([62acaf3](https://github.com/tada5hi/hapic/commit/62acaf3abf3c18b1b72b4636d0e9950627f7a654))


### Bug Fixes

* export distributor types ([010c730](https://github.com/tada5hi/hapic/commit/010c73070968ba65e6d3b0e1468147c7080af4fb))
* rename pushOne to push ([7cb4c9c](https://github.com/tada5hi/hapic/commit/7cb4c9cc510ea8fee9debe942a8abe91c8826151))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.6.0 to ^2.7.0
  * peerDependencies
    * hapic bumped from ^2.6.0 to ^2.7.0
