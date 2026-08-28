# Introduction

BojuVue is a Vue 3 + TypeScript component library, published to npm as
[`@scottkirvan/bojuvue`](https://www.npmjs.com/package/@scottkirvan/bojuvue). It provides
shared landing-page and UX components — a platform-aware download button, a
secondary-links menu, and whatever's added next — for use in VitePress sites and other
Vue 3 apps. Install it, register the components you need, and update later with `npm
update`.

## What you get

- **Every component is exported from one entry point.** Consuming a new component is a
  one-line import change wherever you register components in your app.
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
