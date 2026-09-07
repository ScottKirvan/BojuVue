# Troubleshooting

Symptom-first entries for problems that don't point at their own cause. Growing as
real ones turn up — this isn't meant to be exhaustive on day one.

## A component renders with no styling — no button skin, an unstyled dropdown panel, icons at raw SVG size

**If:** a component (especially [`BVMoreButton`](/components/more-button)'s dropdown
panel — see the callout on that page) looks like plain unstyled HTML instead of a
styled button or floating card, even though it's rendering and behaving correctly
(clicks work, the menu opens, links go where they should) —

**Then:** you're missing BojuVue's stylesheet import. A compiled Vue library's `<style
scoped>` blocks are extracted into a plain CSS file at build time, not auto-injected at
runtime — this is a separate, required import, not something registering the
components already covers:

```ts
import 'bojuvue/style.css'
```

Import it once, anywhere in your app's entry point. One file covers every component
from both import paths (`bojuvue` and `bojuvue/vitepress`) — one import is enough
regardless of which paths you use. See [Import the
stylesheet](/guide/installation#import-the-stylesheet) for the full setup step.

This one is easy to miss because it's partial: a component like `BVButton` or
`BVMoreButton`'s own trigger, on the `/vitepress` import path, renders through
VitePress's real `VPButton` and picks up real theme styling from VitePress itself, with
or without BojuVue's own CSS loaded — so it can look basically fine right up until you
hit something that's entirely BojuVue-authored markup, like the dropdown panel.
