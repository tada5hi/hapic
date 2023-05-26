# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-alpha.10](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2023-05-26)


### Bug Fixes

* **deps:** bump node-fetch-native from 1.1.0 to 1.1.1 ([#297](https://github.com/Tada5hi/hapic/issues/297)) ([9fa4a15](https://github.com/Tada5hi/hapic/commit/9fa4a15a31f428875cf06100fee8fb6989b95f01))
* **deps:** bump ufo from 1.1.1 to 1.1.2 ([#268](https://github.com/Tada5hi/hapic/issues/268)) ([646cb82](https://github.com/Tada5hi/hapic/commit/646cb82d1850dfb0f8cb978858e3ff35b166f971))


### Features

* add header utility methods + set readable-stream to any ([856ecea](https://github.com/Tada5hi/hapic/commit/856ecea43a6bbd339770ef4b5a1b79ca95ac1e37))





# [2.0.0-alpha.9](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2023-04-21)


### Features

* refactored, simplified and enhanced hook management/interaction ([71f68b6](https://github.com/Tada5hi/hapic/commit/71f68b60eca9aa8826fff8058f3a43a3c9d663b3))





# [2.0.0-alpha.8](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2023-04-18)


### Bug Fixes

* imports for type check ([75ba0de](https://github.com/Tada5hi/hapic/commit/75ba0def0c83bc037b4d0496775e3ceb13fab9b7))





# [2.0.0-alpha.7](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2023-04-18)


### Bug Fixes

* default request transformer for patch, put & post ([06525b8](https://github.com/Tada5hi/hapic/commit/06525b8918c8583a8cd23d66c4fd199f4c60f0b6))





# [2.0.0-alpha.6](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2023-04-18)


### Bug Fixes

* context assignment & target build version ([900ff2a](https://github.com/Tada5hi/hapic/commit/900ff2aab2879af21a36042f8cde50dee0eae72d))





# [2.0.0-alpha.5](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2023-04-18)


### Bug Fixes

* add request options typing for nodejs http(s) agent ([e56ab20](https://github.com/Tada5hi/hapic/commit/e56ab203985d88120925872a77f4935407103ecf))





# [2.0.0-alpha.4](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2023-04-18)


### Bug Fixes

* build temp output for non return on response hooks ([ec61e65](https://github.com/Tada5hi/hapic/commit/ec61e6576c1f01f46734aff8bf6070f3160a2973))
* throw last error of error hook chain ([31e740e](https://github.com/Tada5hi/hapic/commit/31e740e5837953824125a11717a6e4536e0b1c60))


### Features

* replaced interceptors with hook aproach ([27b3e24](https://github.com/Tada5hi/hapic/commit/27b3e2439a52ef35a4afcd40bd57dad95023f227))





# [2.0.0-alpha.3](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2023-04-16)


### Features

* implemented fetch client ([e036df0](https://github.com/Tada5hi/hapic/commit/e036df09a002e38025aa8fcf81cbe883244e2ba2))





# [2.0.0-alpha.2](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2023-04-08)


### Features

* better naming for driver error utility helpers ([a0ed089](https://github.com/Tada5hi/hapic/commit/a0ed0891c969b0221a7047ca2bb2771fe9e1ad15))





# [2.0.0-alpha.1](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2023-04-08)


### Features

* add status code verifier for request error ([1629426](https://github.com/Tada5hi/hapic/commit/16294262c50405f8bf7b796a4d3121524c868ee2))





# [2.0.0-alpha.0](https://github.com/Tada5hi/hapic/compare/v1.6.1...v2.0.0-alpha.0) (2023-04-07)


### Bug Fixes

* enhance public domain api(s) + added tests ([9aeb35a](https://github.com/Tada5hi/hapic/commit/9aeb35ac62e7e2c36aa5835e402ee42abe2e930a))


### Features

* allow overriding client config after initialisation ([b117f22](https://github.com/Tada5hi/hapic/commit/b117f22239e33791ee506c392b57956a4c018c5b))
* refactor oauth2 module and domain apis ([c23a479](https://github.com/Tada5hi/hapic/commit/c23a479c1e295e72f4e002a6edd71eea326d0b6d))
* refactored types ([e66ada1](https://github.com/Tada5hi/hapic/commit/e66ada1a53cec23ffa5058817d789737e57190cf))
* verify client by instance and symbol check ([ece1626](https://github.com/Tada5hi/hapic/commit/ece1626dd83bf9bb01b7fb316b52f3bf71cc0f72))


### BREAKING CHANGES

* public api changed
* public api rewritten





# [1.6.0](https://github.com/Tada5hi/hapic/compare/v1.5.0...v1.6.0) (2023-04-03)


### Bug Fixes

* assume non string type for parse auth header ([dd8cb6d](https://github.com/Tada5hi/hapic/commit/dd8cb6db3a3e529d751c448cf3845fe62d310fcf))


### Features

* support providing client driver instance & config as client config ([e15acf9](https://github.com/Tada5hi/hapic/commit/e15acf9051e698f30f74a9aaf0276f85df2369d2))





# [1.4.0](https://github.com/Tada5hi/hapic/compare/v1.3.0...v1.4.0) (2023-03-22)


### Bug Fixes

* **deps:** bump smob & ebec to v1.x ([1b94aba](https://github.com/Tada5hi/hapic/commit/1b94aba02ab9017039b9fcccb897820e0744302f))


### Features

* individual singleton management per package + nullable client constructor argument ([5af2f0c](https://github.com/Tada5hi/hapic/commit/5af2f0cf87808f515044cda8be9c3c038ced7734))





# [1.3.0](https://github.com/Tada5hi/hapic/compare/v1.2.1...v1.3.0) (2023-03-17)


### Features

* create and expose client as default export ([b22db43](https://github.com/Tada5hi/hapic/commit/b22db436bc6ae805019050b6031331787b597f94))
* **harbor:** expose hapic api + custom create-,set,use-client utilities ([5b67b30](https://github.com/Tada5hi/hapic/commit/5b67b30a4f463ec195250d4cdbd3cd8bfa68bb4b))
* refactored config handling ([0067c44](https://github.com/Tada5hi/hapic/commit/0067c441ab07a24e502d88b9e98347025986dc5f))





## [1.2.1](https://github.com/Tada5hi/hapic/compare/v1.2.0...v1.2.1) (2023-02-28)

**Note:** Version bump only for package hapic





# [1.2.0](https://github.com/Tada5hi/hapic/compare/v1.1.0...v1.2.0) (2023-02-15)


### Bug Fixes

* extend generic type arguments ([b0d8628](https://github.com/Tada5hi/hapic/commit/b0d8628d6a97b10a13643b884afa26d7086cdf4c))


### Features

* enforce stricter typings ([5206076](https://github.com/Tada5hi/hapic/commit/5206076ecb203807c9437ed17de5c5e468cf38a4))





# [1.1.0](https://github.com/Tada5hi/hapic/compare/v1.0.1...v1.1.0) (2023-01-27)


### Features

* refactored build pipeline + updated dependencies ([1ba51e1](https://github.com/Tada5hi/hapic/commit/1ba51e15033bfc851fb9f2bfc50d14b97fd9a8ae))





# [1.0.0](https://github.com/Tada5hi/hapic/compare/v0.3.0...v1.0.0) (2022-12-31)

**Note:** Version bump only for package hapic





# 0.3.0 (2022-12-16)


### Bug Fixes

* bump axios version ([a2be601](https://github.com/Tada5hi/hapic/commit/a2be6010d739ebd198a949e0f73f7d6412269acd))
* force version bump ([ee96e9a](https://github.com/Tada5hi/hapic/commit/ee96e9aec71e312c6d5f8d4464b189a2ca800cee))
* include axios in bundle until cjs export is fixed ([a6b0043](https://github.com/Tada5hi/hapic/commit/a6b0043771da089cd3cc8664fe057e428a28ec8a))
* updated axios to v1.1.3 ([26f3740](https://github.com/Tada5hi/hapic/commit/26f37409bc70b79498a560d44097ecc9fcbbe397))


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapic/commit/67daef4dd51e70048404486a816b60d5d289359d))
* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapic/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))





# [0.2.0](https://github.com/Tada5hi/hapic/compare/hapic@0.1.3...hapic@0.2.0) (2022-11-23)


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapic/commit/67daef4dd51e70048404486a816b60d5d289359d))





## [0.1.3](https://github.com/Tada5hi/hapic/compare/hapic@0.1.2...hapic@0.1.3) (2022-11-16)


### Bug Fixes

* bump axios version ([a2be601](https://github.com/Tada5hi/hapic/commit/a2be6010d739ebd198a949e0f73f7d6412269acd))





## [0.1.2](https://github.com/Tada5hi/hapic/compare/hapic@0.1.1...hapic@0.1.2) (2022-10-26)


### Bug Fixes

* force version bump ([ee96e9a](https://github.com/Tada5hi/hapic/commit/ee96e9aec71e312c6d5f8d4464b189a2ca800cee))





## [0.1.1](https://github.com/Tada5hi/hapic/compare/hapic@0.1.0...hapic@0.1.1) (2022-10-26)


### Bug Fixes

* include axios in bundle until cjs export is fixed ([a6b0043](https://github.com/Tada5hi/hapic/commit/a6b0043771da089cd3cc8664fe057e428a28ec8a))





# [0.1.0](https://github.com/Tada5hi/hapic/compare/hapic@0.0.2...hapic@0.1.0) (2022-10-15)


### Bug Fixes

* updated axios to v1.1.3 ([26f3740](https://github.com/Tada5hi/hapic/commit/26f37409bc70b79498a560d44097ecc9fcbbe397))


### Features

* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapic/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))
