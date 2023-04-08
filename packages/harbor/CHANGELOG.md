# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-alpha.2](https://github.com/Tada5hi/hapi/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2023-04-08)


### Features

* better naming for driver error utility helpers ([a0ed089](https://github.com/Tada5hi/hapi/commit/a0ed0891c969b0221a7047ca2bb2771fe9e1ad15))





# [2.0.0-alpha.1](https://github.com/Tada5hi/hapi/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2023-04-08)


### Features

* add status code verifier for request error ([1629426](https://github.com/Tada5hi/hapi/commit/16294262c50405f8bf7b796a4d3121524c868ee2))





# [2.0.0-alpha.0](https://github.com/Tada5hi/hapi/compare/v1.6.1...v2.0.0-alpha.0) (2023-04-07)


### Bug Fixes

* added missing export for project-webhook api ([f3c776d](https://github.com/Tada5hi/hapi/commit/f3c776dd3c87aa0c840cce61075e71ad7a94121a))
* enhance public domain api(s) + added tests ([9aeb35a](https://github.com/Tada5hi/hapi/commit/9aeb35ac62e7e2c36aa5835e402ee42abe2e930a))
* refereces due refactoring ([470c60f](https://github.com/Tada5hi/hapi/commit/470c60f325ffb69a4f6df8a6dd9d648d60cdddc4))


### Features

* allow overriding client config after initialisation ([b117f22](https://github.com/Tada5hi/hapi/commit/b117f22239e33791ee506c392b57956a4c018c5b))
* refactor domain api for project, repository, etc ([d1d506d](https://github.com/Tada5hi/hapi/commit/d1d506d0f64c193fc044a16c9616b8674d0fdbd3))
* refactored types ([e66ada1](https://github.com/Tada5hi/hapi/commit/e66ada1a53cec23ffa5058817d789737e57190cf))
* verify client by instance and symbol check ([ece1626](https://github.com/Tada5hi/hapi/commit/ece1626dd83bf9bb01b7fb316b52f3bf71cc0f72))


### BREAKING CHANGES

* public api changed





## [1.6.1](https://github.com/Tada5hi/hapi/compare/v1.6.0...v1.6.1) (2023-04-03)


### Bug Fixes

* minor export adjustments + peer dep bump ([4506599](https://github.com/Tada5hi/hapi/commit/45065991ee2891d388ea26b2be6354cc2c15b49f))





# [1.6.0](https://github.com/Tada5hi/hapi/compare/v1.5.0...v1.6.0) (2023-04-03)


### Features

* export client dirver check and creator ([0951985](https://github.com/Tada5hi/hapi/commit/09519855f584fe5664d3323d01cdf215eaee2ecc))





# [1.5.0](https://github.com/Tada5hi/hapi/compare/v1.4.0...v1.5.0) (2023-03-23)


### Features

* expose is-client-error check ([f731d69](https://github.com/Tada5hi/hapi/commit/f731d69fe7ac04e23e4e96d4d3c41d2888d8b989))





# [1.4.0](https://github.com/Tada5hi/hapi/compare/v1.3.0...v1.4.0) (2023-03-22)


### Bug Fixes

* cleanup create-client argument signature ([33b10a5](https://github.com/Tada5hi/hapi/commit/33b10a57cf59c565c7470f88d5254d0421b4a637))
* **deps:** bump smob & ebec to v1.x ([1b94aba](https://github.com/Tada5hi/hapi/commit/1b94aba02ab9017039b9fcccb897820e0744302f))


### Features

* individual singleton management per package + nullable client constructor argument ([5af2f0c](https://github.com/Tada5hi/hapi/commit/5af2f0cf87808f515044cda8be9c3c038ced7734))





# [1.3.0](https://github.com/Tada5hi/hapi/compare/v1.2.1...v1.3.0) (2023-03-17)


### Features

* create and expose client as default export ([b22db43](https://github.com/Tada5hi/hapi/commit/b22db436bc6ae805019050b6031331787b597f94))
* expose base-client + config types ([71d9d39](https://github.com/Tada5hi/hapi/commit/71d9d397ec5a0f9629d0f9be5417a340a47484cf))
* **harbor:** expose hapic api + custom create-,set,use-client utilities ([5b67b30](https://github.com/Tada5hi/hapi/commit/5b67b30a4f463ec195250d4cdbd3cd8bfa68bb4b))
* refactored config handling ([0067c44](https://github.com/Tada5hi/hapi/commit/0067c441ab07a24e502d88b9e98347025986dc5f))





## [1.2.1](https://github.com/Tada5hi/hapi/compare/v1.2.0...v1.2.1) (2023-02-28)

**Note:** Version bump only for package @hapic/harbor





# [1.2.0](https://github.com/Tada5hi/hapi/compare/v1.1.0...v1.2.0) (2023-02-15)


### Features

* enforce stricter typings ([5206076](https://github.com/Tada5hi/hapi/commit/5206076ecb203807c9437ed17de5c5e468cf38a4))





# [1.1.0](https://github.com/Tada5hi/hapi/compare/v1.0.1...v1.1.0) (2023-01-27)


### Features

* refactored build pipeline + updated dependencies ([1ba51e1](https://github.com/Tada5hi/hapi/commit/1ba51e15033bfc851fb9f2bfc50d14b97fd9a8ae))





# [1.0.0](https://github.com/Tada5hi/hapi/compare/v0.3.0...v1.0.0) (2022-12-31)


### Bug Fixes

* dump peer-dependencies version ref ([5e8cab0](https://github.com/Tada5hi/hapi/commit/5e8cab08bd7a3c39743fd7dece01b81962db12ac))





# 0.3.0 (2022-12-16)


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapi/commit/67daef4dd51e70048404486a816b60d5d289359d))
* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapi/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))





# [0.2.0](https://github.com/Tada5hi/hapi/compare/@hapic/harbor@0.1.3...@hapic/harbor@0.2.0) (2022-11-23)


### Features

* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapi/commit/67daef4dd51e70048404486a816b60d5d289359d))





## [0.1.3](https://github.com/Tada5hi/hapi/compare/@hapic/harbor@0.1.2...@hapic/harbor@0.1.3) (2022-11-16)

**Note:** Version bump only for package @hapic/harbor





## [0.1.2](https://github.com/Tada5hi/hapi/compare/@hapic/harbor@0.1.1...@hapic/harbor@0.1.2) (2022-10-26)

**Note:** Version bump only for package @hapic/harbor





## [0.1.1](https://github.com/Tada5hi/hapi/compare/@hapic/harbor@0.1.0...@hapic/harbor@0.1.1) (2022-10-26)

**Note:** Version bump only for package @hapic/harbor





# [0.1.0](https://github.com/Tada5hi/hapi/compare/@hapic/harbor@0.0.2...@hapic/harbor@0.1.0) (2022-10-15)


### Features

* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapi/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))
