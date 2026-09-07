# Lessons Learned

A running record of real-world issues surfaced by actually using BojuVue in another
project (dogfooding), and what changed in this repo as a result. Different from
[`mistakes.md`](./mistakes.md), which is about process/workflow slips during
development — this is about defects in what actually got published, found by
consuming it for real. Each entry should say what broke, why this repo's own
dogfooding never caught it, and what changed.

---

## 2026-09-07 — Published package never delivered its own CSS to consumers

**What happened:** `BojuBot` (a separate project consuming the published `bojuvue`
npm package) rendered `BVMoreButton`'s dropdown menu as plain unstyled links — no
panel background, border, shadow, or icon layout — even though everything else
about the component worked correctly (menu opened, links were correct). Root cause:
`package.json`'s `exports` map only listed the two JS entries (`.` and
`./vitepress`). The library's `<style scoped>` blocks all compile into one
`dist/bojuvue.css`, but nothing exposed a subpath to it — a consumer trying to
import it directly (`bojuvue/dist/bojuvue.css`) got `ERR_PACKAGE_PATH_NOT_EXPORTED`,
not just a 404 or a missing-docs gap. Node's own module resolution blocked it.

This repo's own docs site never caught it because `docs/.vitepress/theme/index.ts`
imports component *source* directly from `../../../src/vitepress`, not the published
package — Vite compiles the `.vue` files' `<style>` blocks itself in that setup, so
the question "does a real consumer actually receive this CSS" was never actually
exercised until a separate project installed the real thing from npm.

**Fix:** added `./style.css` and the literal `./dist/bojuvue.css` to `package.json`'s
`exports` map, both pointing at the one CSS file the build already produces (the two
entries share most of the same `.vue` files, so Rollup already merges their scoped
styles into a single `dist/bojuvue.css` — no build config changes were needed, only
exposing what already existed). Verified against a real `npm pack` + install into a
scratch project, not just the manifest, since manifest-only verification is exactly
what missed this the first time.

Documented in `README.md`, `docs/guide/installation.md` (new "Import the stylesheet"
section), `CONTRIBUTING.md`, `CLAUDE.md`, and a consumer-facing callout on
`docs/components/more-button.md` and `docs/appendix/troubleshooting.md` — the two
places someone hitting this symptom is actually likely to land.

**Reusable phrase:** "A compiled library's scoped styles aren't auto-injected at
runtime — they're a separate file a consumer must import, and `exports` has to
actually expose a path to it or that import is flatly blocked, not just
undocumented. A docs site that imports component source directly instead of the
published package will never catch this on its own."
