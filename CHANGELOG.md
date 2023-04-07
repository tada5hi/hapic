# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0-alpha.0](https://github.com/Tada5hi/hapic/compare/v1.6.1...v2.0.0-alpha.0) (2023-04-07)


### Bug Fixes

* added missing export for project-webhook api ([f3c776d](https://github.com/Tada5hi/hapic/commit/f3c776dd3c87aa0c840cce61075e71ad7a94121a))
* enhance public domain api(s) + added tests ([9aeb35a](https://github.com/Tada5hi/hapic/commit/9aeb35ac62e7e2c36aa5835e402ee42abe2e930a))
* public api, added tests + extended README.md ([d9ee9b0](https://github.com/Tada5hi/hapic/commit/d9ee9b04efc2e559320b9dedc25167ce01edf59b))
* refereces due refactoring ([470c60f](https://github.com/Tada5hi/hapic/commit/470c60f325ffb69a4f6df8a6dd9d648d60cdddc4))


### Features

* allow overriding client config after initialisation ([b117f22](https://github.com/Tada5hi/hapic/commit/b117f22239e33791ee506c392b57956a4c018c5b))
* allow passing client credentials as header ([96f50d0](https://github.com/Tada5hi/hapic/commit/96f50d044a478546a82446dfc81310d9ec37dd53))
* enhance typing for vault mounts ssh and key-value ([8782f1f](https://github.com/Tada5hi/hapic/commit/8782f1f40077d428c6c2696ebaeda2354337d886))
* refactor domain api for project, repository, etc ([d1d506d](https://github.com/Tada5hi/hapic/commit/d1d506d0f64c193fc044a16c9616b8674d0fdbd3))
* refactor oauth2 module and domain apis ([c23a479](https://github.com/Tada5hi/hapic/commit/c23a479c1e295e72f4e002a6edd71eea326d0b6d))
* refactored types ([e66ada1](https://github.com/Tada5hi/hapic/commit/e66ada1a53cec23ffa5058817d789737e57190cf))
* verify client by instance and symbol check ([ece1626](https://github.com/Tada5hi/hapic/commit/ece1626dd83bf9bb01b7fb316b52f3bf71cc0f72))


### BREAKING CHANGES

* public api changed
* public api rewritten





## [1.6.1](https://github.com/Tada5hi/hapic/compare/v1.6.0...v1.6.1) (2023-04-03)


### Bug Fixes

* minor export adjustments + peer dep bump ([4506599](https://github.com/Tada5hi/hapic/commit/45065991ee2891d388ea26b2be6354cc2c15b49f))





# [1.6.0](https://github.com/Tada5hi/hapic/compare/v1.5.0...v1.6.0) (2023-04-03)


### Bug Fixes

* assume non string type for parse auth header ([dd8cb6d](https://github.com/Tada5hi/hapic/commit/dd8cb6db3a3e529d751c448cf3845fe62d310fcf))


### Features

* export client dirver check and creator ([0951985](https://github.com/Tada5hi/hapic/commit/09519855f584fe5664d3323d01cdf215eaee2ecc))
* support providing client driver instance & config as client config ([e15acf9](https://github.com/Tada5hi/hapic/commit/e15acf9051e698f30f74a9aaf0276f85df2369d2))





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
* **harbor:** expose hapic api + custom create-,set,use-client utilities ([5b67b30](https://github.com/Tada5hi/hapic/commit/5b67b30a4f463ec195250d4cdbd3cd8bfa68bb4b))
* **oauth2:** expose hapic api + custom create-,set,use-client utilities ([c82248a](https://github.com/Tada5hi/hapic/commit/c82248a2bbb597e54cca6aff91105750ea13e1f4))
* refactored config handling ([0067c44](https://github.com/Tada5hi/hapic/commit/0067c441ab07a24e502d88b9e98347025986dc5f))
* **vault:** expose hapic api + custom create-,set,use-client utilities ([bb68cba](https://github.com/Tada5hi/hapic/commit/bb68cba110b48693d9dd99c8178afaa33a285623))





## [1.2.1](https://github.com/Tada5hi/hapic/compare/v1.2.0...v1.2.1) (2023-02-28)


### Bug Fixes

* open-id endpoint construction ([2d9ff41](https://github.com/Tada5hi/hapic/commit/2d9ff41e3f438acaaa46c4037e91595fd2cd50fe))





# [1.2.0](https://github.com/Tada5hi/hapic/compare/v1.1.0...v1.2.0) (2023-02-15)


### Bug Fixes

* extend generic type arguments ([b0d8628](https://github.com/Tada5hi/hapic/commit/b0d8628d6a97b10a13643b884afa26d7086cdf4c))


### Features

* enforce stricter typings ([5206076](https://github.com/Tada5hi/hapic/commit/5206076ecb203807c9437ed17de5c5e468cf38a4))





# [1.1.0](https://github.com/Tada5hi/hapic/compare/v1.0.1...v1.1.0) (2023-01-27)


### Features

* refactored build pipeline + updated dependencies ([1ba51e1](https://github.com/Tada5hi/hapic/commit/1ba51e15033bfc851fb9f2bfc50d14b97fd9a8ae))





## [1.0.1](https://github.com/Tada5hi/hapic/compare/v1.0.0...v1.0.1) (2023-01-10)


### Bug Fixes

* **deps:** bump json5 from 1.0.1 to 1.0.2 ([571c3a0](https://github.com/Tada5hi/hapic/commit/571c3a00ffb96040cb856cf0d4dab05124863d16))
* **oauth2:** remove obsolote jsonwebtoken type dependency ([3b0f787](https://github.com/Tada5hi/hapic/commit/3b0f787976ab26716d3ddab372d4327607d4dc33))





# [1.0.0](https://github.com/Tada5hi/hapic/compare/v0.3.0...v1.0.0) (2022-12-31)


### Bug Fixes

* **deps:** bump @types/jsonwebtoken from 8.5.9 to 9.0.0 ([74ba2bc](https://github.com/Tada5hi/hapic/commit/74ba2bc3aefca16a3aa50aec47a69a05b96d5148))
* dump peer-dependencies version ref ([5e8cab0](https://github.com/Tada5hi/hapic/commit/5e8cab08bd7a3c39743fd7dece01b81962db12ac))





# 0.3.0 (2022-12-16)


### Bug Fixes

* bump axios version ([a2be601](https://github.com/Tada5hi/hapic/commit/a2be6010d739ebd198a949e0f73f7d6412269acd))
* force version bump ([ee96e9a](https://github.com/Tada5hi/hapic/commit/ee96e9aec71e312c6d5f8d4464b189a2ca800cee))
* include axios in bundle until cjs export is fixed ([a6b0043](https://github.com/Tada5hi/hapic/commit/a6b0043771da089cd3cc8664fe057e428a28ec8a))
* updated axios to v1.1.3 ([26f3740](https://github.com/Tada5hi/hapic/commit/26f37409bc70b79498a560d44097ecc9fcbbe397))


### Features

* **oauth2:** enhanced authorize query building + minor cleanup ([63f501c](https://github.com/Tada5hi/hapic/commit/63f501c6d50949ae8b0e68e150947c9798c7f488))
* updated to axios v1.2.0 ([67daef4](https://github.com/Tada5hi/hapic/commit/67daef4dd51e70048404486a816b60d5d289359d))
* use rollup v3 + updated axios to v1.x ([85c1f1d](https://github.com/Tada5hi/hapic/commit/85c1f1d3e97a1f9ab84e88773bc6ca722a90b26f))
