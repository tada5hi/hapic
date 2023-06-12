# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.11...v2.0.0) (2023-06-12)


### Features

* add method to update mount ([434f6ae](https://github.com/Tada5hi/hapic/commit/434f6aea262c6ff4e1642419a912724abb851c2f))
* change method signature of key-value engine & mount api client ([5476d96](https://github.com/Tada5hi/hapic/commit/5476d96bfbf5523bc40687b1dbd229f2ad70016b))


### BREAKING CHANGES

* Public API changed





# [2.0.0-alpha.11](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-06-03)


### Bug Fixes

* **deps:** bump smob from 1.1.1 to 1.4.0 ([#300](https://github.com/Tada5hi/hapic/issues/300)) ([3967830](https://github.com/Tada5hi/hapic/commit/39678303d6ce907a0540b7c8d77447148c298b9d))





# [2.0.0-alpha.10](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2023-05-26)


### Bug Fixes

* **deps:** bump smob from 1.0.0 to 1.1.1 ([#293](https://github.com/Tada5hi/hapic/issues/293)) ([5e67f07](https://github.com/Tada5hi/hapic/commit/5e67f07ba7e1489cc35669bd74cd110e6a83b128))


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

**Note:** Version bump only for package @hapic/vault





# [2.0.0-alpha.4](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2023-04-18)

**Note:** Version bump only for package @hapic/vault





# [2.0.0-alpha.3](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2023-04-16)


### Bug Fixes

* exports ([3f649d3](https://github.com/Tada5hi/hapic/commit/3f649d3a3d5f2db62b5789f05979fe0ba91c5e0e))


### Features

* updated oauth2, harbor & vault usage ([e5be624](https://github.com/Tada5hi/hapic/commit/e5be6241a9c77eecc565fdd2acea59e964f96194))





# [2.0.0-alpha.2](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2023-04-08)


### Features

* better naming for driver error utility helpers ([a0ed089](https://github.com/Tada5hi/hapic/commit/a0ed0891c969b0221a7047ca2bb2771fe9e1ad15))
* renamed option engine to mount ([2c5fcfa](https://github.com/Tada5hi/hapic/commit/2c5fcfa5f1f9ad772148f1a098362cb26970e525))





# [2.0.0-alpha.1](https://github.com/Tada5hi/hapic/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2023-04-08)


### Features

* add status code verifier for request error ([1629426](https://github.com/Tada5hi/hapic/commit/16294262c50405f8bf7b796a4d3121524c868ee2))





# [2.0.0-alpha.0](https://github.com/Tada5hi/hapic/compare/v1.6.1...v2.0.0-alpha.0) (2023-04-07)


### Bug Fixes

* public api, added tests + extended README.md ([d9ee9b0](https://github.com/Tada5hi/hapic/commit/d9ee9b04efc2e559320b9dedc25167ce01edf59b))
* refereces due refactoring ([470c60f](https://github.com/Tada5hi/hapic/commit/470c60f325ffb69a4f6df8a6dd9d648d60cdddc4))


### Features

* allow overriding client config after initialisation ([b117f22](https://github.com/Tada5hi/hapic/commit/b117f22239e33791ee506c392b57956a4c018c5b))
* enhance typing for vault mounts ssh and key-value ([8782f1f](https://github.com/Tada5hi/hapic/commit/8782f1f40077d428c6c2696ebaeda2354337d886))
* refactored types ([e66ada1](https://github.com/Tada5hi/hapic/commit/e66ada1a53cec23ffa5058817d789737e57190cf))
* verify client by instance and symbol check ([ece1626](https://github.com/Tada5hi/hapic/commit/ece1626dd83bf9bb01b7fb316b52f3bf71cc0f72))


### BREAKING CHANGES

* public api changed





## [1.6.1](https://github.com/Tada5hi/hapic/compare/v1.6.0...v1.6.1) (2023-04-03)


### Bug Fixes

* minor export adjustments + peer dep bump ([4506599](https://github.com/Tada5hi/hapic/commit/45065991ee2891d388ea26b2be6354cc2c15b49f))





# [1.6.0](https://github.com/Tada5hi/hapic/compare/v1.5.0...v1.6.0) (2023-04-03)


### Features

* export client dirver check and creator ([0951985](https://github.com/Tada5hi/hapic/commit/09519855f584fe5664d3323d01cdf215eaee2ecc))





# [1.5.0](https://github.com/Tada5hi/hapic/compare/v1.4.0...v1.5.0) (2023-03-23)


### Features

* expose is-client-error check ([f731d69](https://github.com/Tada5hi/hapic/commit/f731d69fe7ac04e23e4e96d4d3c41d2888d8b989))





# [1.4.0](https://github.com/Tada5hi/hapic/compare/v1.3.0...v1.4.0) (2023-03-22)


### Bug Fixes

* cleanup create-client argument signature ([33b10a5](https://github.com/Tada5hi/hapic/commit/33b10a57cf59c565c7470f88d5254d0421b4a637))
* **deps:** bump smob & ebec to v1.x ([1b94aba](https://github.com/Tada5hi/hapic/commit/1b94aba02ab9017039b9fcccb897820e0744302f))


### Features

* individual singleton management per package + nullable client constructor argument ([5af2f0c](https://github.com/Tada5hi/hapic/commit/5af2f0cf87808f515044cda8be9c3c038ced7734))





# [1.3.0](https://github.com/Tada5hi/hapic/compare/v1.2.1...v1.3.0) (2023-03-17)


### Features

* create and expose client as default export ([b22db43](https://github.com/Tada5hi/hapic/commit/b22db436bc6ae805019050b6031331787b597f94))
* expose base-client + config types ([71d9d39](https://github.com/Tada5hi/hapic/commit/71d9d397ec5a0f9629d0f9be5417a340a47484cf))
* refactored config handling ([0067c44](https://github.com/Tada5hi/hapic/commit/0067c441ab07a24e502d88b9e98347025986dc5f))
* **vault:** expose hapic api + custom create-,set,use-client utilities ([bb68cba](https://github.com/Tada5hi/hapic/commit/bb68cba110b48693d9dd99c8178afaa33a285623))





## [1.2.1](https://github.com/Tada5hi/hapic/compare/v1.2.0...v1.2.1) (2023-02-28)

**Note:** Version bump only for package @hapic/vault





# [1.2.0](https://github.com/Tada5hi/hapic/compare/v1.1.0...v1.2.0) (2023-02-15)


### Features

* enforce stricter typings ([5206076](https://github.com/Tada5hi/hapic/commit/5206076ecb203807c9437ed17de5c5e468cf38a4))





# [1.1.0](https://github.com/Tada5hi/hapic/compare/v1.0.1...v1.1.0) (2023-01-27)


### Features

* refactored build pipeline + updated dependencies ([1ba51e1](https://github.com/Tada5hi/hapic/commit/1ba51e15033bfc851fb9f2bfc50d14b97fd9a8ae))





# [1.0.0](https://github.com/Tada5hi/hapic/compare/v0.3.0...v1.0.0) (2022-12-31)


### Bug Fixes

* dump peer-dependencies version ref ([5e8cab0](https://github.com/Tada5hi/hapic/commit/5e8cab08bd7a3c39743fd7dece01b81962db12ac))





# 0.3.0 (2022-12-16)


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapic/commit/67daef4dd51e70048404486a816b60d5d289359d))
* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapic/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))





# [0.2.0](https://github.com/Tada5hi/hapic/compare/@hapic/vault@0.1.3...@hapic/vault@0.2.0) (2022-11-23)


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapic/commit/67daef4dd51e70048404486a816b60d5d289359d))





## [0.1.3](https://github.com/Tada5hi/hapic/compare/@hapic/vault@0.1.2...@hapic/vault@0.1.3) (2022-11-16)

**Note:** Version bump only for package @hapic/vault





## [0.1.2](https://github.com/Tada5hi/hapic/compare/@hapic/vault@0.1.1...@hapic/vault@0.1.2) (2022-10-26)

**Note:** Version bump only for package @hapic/vault





## [0.1.1](https://github.com/Tada5hi/hapic/compare/@hapic/vault@0.1.0...@hapic/vault@0.1.1) (2022-10-26)

**Note:** Version bump only for package @hapic/vault





# [0.1.0](https://github.com/Tada5hi/hapic/compare/@hapic/vault@0.0.2...@hapic/vault@0.1.0) (2022-10-15)


### Features

* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapic/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))
