# Changelog

## [0.1.0](https://github.com/ScottKirvan/BojuVue/compare/v0.0.4...v0.1.0) (2026-08-26)


### Features

* add platform-aware DownloadButton component ([2154a00](https://github.com/ScottKirvan/BojuVue/commit/2154a000ea273a5380cee783a239d0b2c65603ca))
* PlatformButton rework — naming, VPButton integration, core/VitePress split ([da0dfdf](https://github.com/ScottKirvan/BojuVue/commit/da0dfdfb2a4021941bc2ec9a62a9b05c48895fae))
* render BVPlatformButton through VPButton, add theme/size/target/rel/icon props ([98d1fd1](https://github.com/ScottKirvan/BojuVue/commit/98d1fd1567faeb5e75fe2d0dffafb271a088aa10))
* split BVPlatformButton into a core component and a VitePress adapter ([f6a3312](https://github.com/ScottKirvan/BojuVue/commit/f6a3312a2b0d993d6ab26674077e6c26b5c14af8))


### Bug Fixes

* add horizontal spacing between adjacent DownloadButton instances ([ceca365](https://github.com/ScottKirvan/BojuVue/commit/ceca3657adffc65daefb43b64af2d3211de0f435))
* add spacing above DownloadButton when used after the hero actions row ([e979f8d](https://github.com/ScottKirvan/BojuVue/commit/e979f8d47d892ad9195dcd0104e139bd7ae5c41e))
* add UA fallback for desktop detection and fix absolute manifestUrl handling ([012c881](https://github.com/ScottKirvan/BojuVue/commit/012c8815baeb397797ff7870325dad7e55b1ff17))
* add UA fallback for desktop detection and fix absolute manifestUrl handling ([56f0dab](https://github.com/ScottKirvan/BojuVue/commit/56f0dab37c842f32a9536febc7a6fd6116c63e20))
* add vitepress as a devDependency alongside the optional peer dependency ([e18bda4](https://github.com/ScottKirvan/BojuVue/commit/e18bda465f60bc02c597e99996bd81e41ba553af))
* decouple BVPlatformButton's generic and VitePress implementations ([f15043e](https://github.com/ScottKirvan/BojuVue/commit/f15043e8e0952f617dafa6c1ee206ca04d9331d3))
* give the core component its own styling instead of borrowing VPButton's class name ([5f73071](https://github.com/ScottKirvan/BojuVue/commit/5f73071237c449a4a168941c4d8396f417b85792))
* restructure manifest schema so labels are nested, not conventional ([f62aae0](https://github.com/ScottKirvan/BojuVue/commit/f62aae0e32f1b79b3d0c6e02347c6dac6ca5148e))
* rework DownloadButton per PR review feedback ([0a1148a](https://github.com/ScottKirvan/BojuVue/commit/0a1148a10d67d2678681687826182762d82d7838))
* trigger docs deploy on src/ changes too ([ad8cfd5](https://github.com/ScottKirvan/BojuVue/commit/ad8cfd5646f16a6fbb82562bb505d2265d095b85))

## [0.0.4](https://github.com/ScottKirvan/BojuVue/compare/v0.0.3...v0.0.4) (2026-08-24)


### Bug Fixes

* use RELEASE_PLEASE_TOKEN so push events trigger downstream workflows ([fccebfb](https://github.com/ScottKirvan/BojuVue/commit/fccebfb3229cfaf0e740fbfec358f3f0fd37be37))

Includes PRs: [#16](https://github.com/ScottKirvan/BojuVue/pull/16), [#17](https://github.com/ScottKirvan/BojuVue/pull/17)

## [0.0.3](https://github.com/ScottKirvan/BojuVue/compare/v0.0.2...v0.0.3) (2026-08-24)


### Bug Fixes

* add repository field to package.json for npm provenance validation ([5f22366](https://github.com/ScottKirvan/BojuVue/commit/5f22366d876d325605d7b9e5e6790ba12458b5ab))

Includes PRs: [#14](https://github.com/ScottKirvan/BojuVue/pull/14), [#15](https://github.com/ScottKirvan/BojuVue/pull/15)

## [0.0.2](https://github.com/ScottKirvan/BojuVue/compare/v0.0.1...v0.0.2) (2026-08-24)


### Bug Fixes

* add NODE_AUTH_TOKEN back alongside provenance flag ([11b2af7](https://github.com/ScottKirvan/BojuVue/commit/11b2af753a72f1de648d44f45339dff847aef91c))

Includes PRs: [#12](https://github.com/ScottKirvan/BojuVue/pull/12), [#13](https://github.com/ScottKirvan/BojuVue/pull/13)

## [0.0.1](https://github.com/ScottKirvan/BojuVue/compare/v0.0.0...v0.0.1) (2026-08-24)


### Bug Fixes

* explicitly set component in release-please config to prevent undefined mismatch ([c146101](https://github.com/ScottKirvan/BojuVue/commit/c1461015bad97107d877dbc1efb0d1f5dee3b98e))
* fire release-please ([9398d4a](https://github.com/ScottKirvan/BojuVue/commit/9398d4a560dd89f75737dff588f3bdfb80549188))
* switch npm publish to OIDC trusted publishing (no token required) ([10591ad](https://github.com/ScottKirvan/BojuVue/commit/10591adcba5b9a9f3f949eb6767bb23ba6fb225d))

Includes PRs: [#10](https://github.com/ScottKirvan/BojuVue/pull/10), [#11](https://github.com/ScottKirvan/BojuVue/pull/11), [#9](https://github.com/ScottKirvan/BojuVue/pull/9)

## 0.0.0 (2026-08-24)


### Features

* add HelloWorld component as a component-export exercise ([3544ed1](https://github.com/ScottKirvan/BojuVue/commit/3544ed1e5c10fc7cc30196331c9c90893b78b2bf))
* add HelloWorld component as a component-export exercise ([6b05f42](https://github.com/ScottKirvan/BojuVue/commit/6b05f42ebf1d3c0282c90b578aec644192478433))


### Bug Fixes

* resolve vue in docs build when it imports outside docs/ ([421c16a](https://github.com/ScottKirvan/BojuVue/commit/421c16a55e1d59c4af9377ae1b90ab561793033f))
* wire automated npm publish on release ([6519079](https://github.com/ScottKirvan/BojuVue/commit/651907966465b5119c87737f7c37b9593f5a4ba9))

## Changelog
>[!NOTE]
> This file and it's version format is automatically 
> generated by [Please-Release](https://github.com/googleapis/release-please-action), 
> and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
