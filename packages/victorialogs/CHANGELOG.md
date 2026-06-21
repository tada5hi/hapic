# Changelog

## [2.0.1](https://github.com/tada5hi/hapic/compare/victorialogs-v2.0.0...victorialogs-v2.0.1) (2026-06-21)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^3.0.0 to ^3.0.1
  * peerDependencies
    * hapic bumped from ^3.0.0 to ^3.0.1

## [2.0.0](https://github.com/tada5hi/hapic/compare/victorialogs-v1.0.3...victorialogs-v2.0.0) (2026-06-20)


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

## [1.0.3](https://github.com/tada5hi/hapic/compare/victorialogs-v1.0.2...victorialogs-v1.0.3) (2026-02-25)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.8.1 to ^2.8.2
  * peerDependencies
    * hapic bumped from ^2.8.1 to ^2.8.2

## [1.0.2](https://github.com/tada5hi/hapic/compare/victorialogs-v1.0.1...victorialogs-v1.0.2) (2026-01-07)


### Bug Fixes

* use constant for instance name check ([4e796a4](https://github.com/tada5hi/hapic/commit/4e796a4170bf130c8ba22db690cdfd212bc067ba))

## [1.0.1](https://github.com/tada5hi/hapic/compare/victorialogs-v1.0.0...victorialogs-v1.0.1) (2026-01-07)


### Bug Fixes

* process queriery query response stream ([f854ec3](https://github.com/tada5hi/hapic/commit/f854ec3ba7932e319861d2fa6b8be87fdd492588))

## 1.0.0 (2026-01-05)


### Features

* add vicotrialogs client sdk ([dbdef6b](https://github.com/tada5hi/hapic/commit/dbdef6b2daef328efe57b707d225a0a3015a20e5))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * hapic bumped from ^2.8.0 to ^2.8.1
  * peerDependencies
    * hapic bumped from ^2.8.0 to ^2.8.1
