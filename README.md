# BojuVue 보주뷰

[![starline](https://raw.githubusercontent.com/ScottKirvan/BojuVue/refs/heads/starlines/ScottKirvan/BojuVue/starline.svg)](https://github.com/qoomon/starlines)
[![stars](https://img.shields.io/github/stars/ScottKirvan/BojuVue)](https://github.com/ScottKirvan/BojuVue/stargazers)
[![last update](https://img.shields.io/github/last-commit/ScottKirvan/BojuVue)](https://github.com/ScottKirvan/BojuVue/commits/main)
[![license](https://img.shields.io/github/license/ScottKirvan/BojuVue.svg)](https://github.com/ScottKirvan/BojuVue/blob/main/LICENSE.md)
[![discord](https://img.shields.io/discord/1052011377415438346?style=flat-square&label=discord&color=00ACD7)](https://discord.gg/TN6XJSNK5Y)

BojuVue is a Vue 3 component library including a download button that serves each visitor the right build for their OS. Works in any Vue 3 app; VitePress-aware variants at a second import path, zero VitePress overhead in the generic build.

<!-- TODO: demo GIF — record label changing across macOS, Windows, Linux → save to assets/media/demo.gif -->

**[See it live](https://www.scottkirvan.com/BojuVue/appendix/examples.html)** — every component rendered, not just described.

```sh
npm install bojuvue
```

```vue
<script setup>
import { BVPlatformButton } from 'bojuvue'
</script>

<template>
  <BVPlatformButton
    manifest-url="/platformButton.json"
    fallback-href="https://github.com/you/app/releases"
  />
</template>
```

Works as-is in any Vue 3 app. Building a VitePress site instead? Swap the import for
`bojuvue/vitepress` to get real `VPButton` theme styling, and register it once so every
`.md` page can use it with no per-page import:

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import * as BojuVue from 'bojuvue/vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    for (const [name, component] of Object.entries(BojuVue)) {
      app.component(name, component)
    }
  },
}
```

```md
<!-- any .md page, no import needed -->
<BVPlatformButton manifest-url="platformButton.json" />
```

Your manifest (`public/platformButton.json`) — put one entry under `platforms` for each
platform you ship for:

```json
{
  "platforms": {
    "windows": { "href": "https://example.com/app.msi" },
    "macos": { "href": "https://example.com/app.dmg" },
    "linux": { "href": "https://example.com/app.tar.gz" }
  }
}
```

**[Documentation](https://scottkirvan.github.io/BojuVue/)** -- props reference, live demos, full setup guide, every component.

What's in the package
---------------------

Published to npm as [`bojuvue`](https://www.npmjs.com/package/bojuvue). It exists so that VitePress sites can share one set of landing-page components instead of duplicating them per repo. This repo gets updated, the package gets published, and every consuming site picks it up with `npm update`.

- **BVPlatformButton** — reads the visitor's OS from the browser, fetches a manifest you host, and links to the right download. No manifest entry for a platform? The button hides itself, or shows a fallback link if you provide one. VitePress sites get real `VPButton` styling from `bojuvue/vitepress`; plain Vue 3 apps use the same prop surface without any VitePress dependency.
- **BVMoreButton** — an overflow dropdown for the secondary links every project needs (repo, report a bug, request a feature) without letting them outweigh your primary call-to-action. Modeled on the pattern Obsidian uses on its community-plugin pages. Visible-text mode ("More...") or a compact icon-only "⋯" trigger; VitePress sites get real `VPButton` styling for free via `bojuvue/vitepress`, same as `BVPlatformButton`.
  <!-- TODO: demo GIF/screenshot — the dropdown open, showing the GitHub/bug/feature links → save to assets/media/more-button-demo.gif -->
- **BVButton** — VitePress's own `VPButton` prop shape, usable in any Vue 3 app. The primitive the others build on.
- **BVIconButton** — `BVButton` with an optional inline SVG icon.

Every component exports from `bojuvue`. Components with VitePress-specific builds are located at `bojuvue/vitepress` — same exported name, resolves VitePress-specific values and renders through real VitePress components. `vitepress` is an optional peer dependency: installing the package alone never requires it.

Contributing
------------
See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, the branch and commit
conventions, and step-by-step instructions for adding a new component.

Contributions / Contact
-----------------------
- Please [file an issue](https://github.com/ScottKirvan/BojuVue/issues/new), or [grab a fork](https://github.com/ScottKirvan/BojuVue/fork), hack away, and submit a [pull request](https://github.com/ScottKirvan/BojuVue/pulls).
- Contact me at [linkedin.com/in/scottkirvan/](https://www.linkedin.com/in/scottkirvan/)
- You can also find me on [Discord](https://discord.gg/TN6XJSNK5Y) — I'm cptvideo.

Credits
-------
**BojuVue** — Copyright (c) 2026 [Scott Kirvan](https://github.com/ScottKirvan). [MIT License](LICENSE.md).

Scaffolded from [ScooterGitTemplate](https://github.com/ScottKirvan/ScooterGitTemplate).

Project Link: [BojuVue](https://github.com/ScottKirvan/BojuVue)
[CHANGELOG](notes/CHANGELOG.md)
[TODO](notes/TODO.md)
