# Introduction

BojuVue is a Vue 3 + TypeScript component library, published to npm as
[`@scottkirvan/bojuvue`](https://www.npmjs.com/package/@scottkirvan/bojuvue). It exists
to solve one specific problem: a homepage blog and several local documentation sites,
all built on VitePress, all need the same handful of landing-page and UX components —
a platform-aware download button, a secondary-links menu, and whatever comes next.
Without a shared library, each site either duplicates that code or drifts out of sync
with it. BojuVue is the fix: build a component once here, publish it, and every
consuming site picks up the update with `npm update`.

## What you get

- **Every component is exported from one entry point.** Consuming a new component is a
  one-line import change in a site's `.vitepress/theme/index.ts`.
- **`vue` is a peer dependency.** A consuming site uses its own Vue instance — no
  duplicate copy of Vue in the bundle, no broken reactivity across component
  boundaries.
- **VitePress-aware components get real VitePress styling for free.** A component that
  needs something VitePress-specific (site data, the router, VitePress's own `VPButton`)
  ships a build made specifically for that context, available from a second import
  path — see [Installation & Setup](/guide/installation) for how to pick between them.

## Where to go next

- [Installation & Setup](/guide/installation) — get a component running in your site.
- [Components](/components/) — the reference: every component's props, failure modes,
  and a usage example.
