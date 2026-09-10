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

---

## 2026-09-09 — A "verified" fix failed twice more before it actually worked, because the test environment wasn't the real one

**What happened:** `bojuvue/vitepress`'s internal `import { VPButton } from
'vitepress/theme'` broke a consumer's production SSR build (#70) — Vite externalizes
`node_modules` dependencies by default during an SSR build, which routes that import
through Node's raw ESM loader instead of Vite's own resolver, and Node's loader
chokes on it. The fix (#72) was a small Vite plugin a consumer adds to their own
config, setting `ssr.noExternal: ['bojuvue']` so Vite bundles the package through its
own resolver instead.

Verifying it took three attempts, and the first two both looked successful at the
time:

1. **First repro, `npm install file:../bojuvue` in a throwaway VitePress site: build
   succeeded with no fix applied at all.** That looked like good news — until it was
   clear it meant the repro was broken, not the bug. `file:` with a directory path
   installs as a symlink by default, and Vite's dependency-externalization step —
   the exact mechanism the bug lives inside — treats a symlinked package differently
   and never externalizes it. The repro was testing something adjacent to the bug,
   not the bug itself. Packing a real tarball (`npm pack`, then installing *that*)
   and pointing the same repro at it reproduced #70's exact reported error
   immediately.
2. **Second pass, fix applied, same tarball-based repro: build succeeded, rendering
   real `VPButton` markup.** Called verified. It wasn't — testing against BojuBot,
   the actual project that filed #70, failed a completely different way:
   `ESM only but it was tried to load by require`. BojuBot's `.vitepress/config.js`
   is plain `.js` under a `package.json` with no `"type": "module"`, so Vite's own
   config-file bundler loads it as CommonJS and `require()`s whatever it imports —
   but the shipped plugin build was ESM-only. The throwaway repro's config file was
   `.mts`, an extension that forces ESM treatment no matter what a `package.json`
   says, so it structurally could not have caught this — not bad luck, a blind spot
   built into the repro's own setup.
3. **Third pass:** shipped the plugin as both ESM (`dist/vite.js`) and CommonJS
   (`dist/vite.cjs`) builds, both declared in `package.json`'s `exports` map. Verified
   against BojuBot's real, completely unmodified `config.js` — no renamed file, no
   added `"type": "module"` — and the real `builddocs` script succeeded.

Two unrelated failure modes (symlink-skips-externalization, then
extension-decides-module-format), and each prior "verified" pass had, by construction,
made a specific environmental choice — symlink vs. tarball install, then `.mts` vs.
plain `.js` — that happened to keep it from ever encountering the next one. Neither
was a fluke or bad luck: both are well-documented, predictable behaviors (Vite's own
externalization docs cover the symlink case; Node's own module docs specify the
extension/`"type"` interaction exactly) — the repro just wasn't built with either in
mind up front.

**Fix:** treat "passes my own repro" as necessary, not sufficient. A repro is only as
faithful as the choices baked into building it, and some of the most consequential
ones — how a dependency gets installed, what a config file is named, what a
`package.json` declares — are exactly the kind of detail that's easy to pick
arbitrarily while writing a throwaway test and never revisit. Two standing checks
came out of this:
- Anything touching npm dependency resolution, bundler externalization, or SSR
  specifically: install via a packed tarball (`npm pack`), never a `file:` directory
  reference — the latter is a symlink by default and silently skips whichever
  resolution/externalization path the bug depends on.
- Before calling any fix to a reported bug "done," re-run it against the actual
  reporting consumer's real, unmodified files — not a purpose-built repro — since a
  repro's own incidental setup choices are exactly what can make it blind to a
  second failure mode hiding behind the first.

**Reusable phrase:** "A fix that only passes your own throwaway repro isn't verified
yet — a repro is only as faithful as the incidental choices baked into building it
(how a dependency was installed, a config file's extension, whether `package.json`
declares `\"type\": \"module\"`), and those choices can silently keep it from ever
encountering a real failure mode. Before calling a bug fix done: install the change
via a packed tarball, not a `file:`/symlink dependency, if it touches dependency
resolution or bundler externalization at all; and re-verify against the actual
reporting consumer's real, unmodified files, not just your own repro, since two
different environments can each dodge a different bug in the same fix."
