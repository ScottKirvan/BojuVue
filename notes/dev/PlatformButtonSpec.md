# Platform Button — Spec

Working document for where the component currently shipped as `DownloadButton`
is going. Not a finished plan — a snapshot of what exists, what's decided, and
what's still open, so the threads from several conversations don't get lost.
Update this in place as decisions land; don't let it go stale.

## Current state (as of this writing)

- Component: `src/DownloadButton.vue`, exported from `src/index.ts`.
- Logic: `src/platform.ts` — `detectPlatform()`, `resolveDownload()`, types
  `PlatformId`, `PlatformEntry`, `DownloadManifest`.
- Detects 6 platforms via `navigator.platform`/`navigator.userAgent`: windows,
  macos, linux, android, ios, chromeos.
- Manifest: a JSON file (default `downloadButton.json`) fetched at runtime;
  each platform key maps to `{ href, label? }`.
- Tests: `src/platform.test.ts` (20 cases), `src/HelloWorld.test.ts`.
- Docs: `docs/components/download-button.md`.
- Styling: hand-rolled `.bv-download-button` CSS that duplicates VitePress's
  own `VPButton` look via the same `--vp-button-brand-*` variables, rather
  than using `VPButton` itself.
- Coupled to VitePress: imports `useData` from `'vitepress'` for `site.base`.
- Published and live: `bojuvue` on npm, this component included.

## Known issues (filed, not yet resolved)

| # | Priority | What |
| --- | --- | --- |
| [#19](https://github.com/ScottKirvan/BojuVue/issues/19) | High | Desktop detection relies solely on deprecated `navigator.platform`, no UA fallback |
| [#20](https://github.com/ScottKirvan/BojuVue/issues/20) | High | `manifestUrl` base-path prefixing breaks absolute URLs |
| [#21](https://github.com/ScottKirvan/BojuVue/issues/21) | High | `DownloadButton.vue` itself has zero test coverage |
| [#22](https://github.com/ScottKirvan/BojuVue/issues/22) | Medium | No `res.ok` check before parsing the manifest response |
| [#23](https://github.com/ScottKirvan/BojuVue/issues/23) | Medium | `manifestUrl` prop isn't reactive after mount |
| [#24](https://github.com/ScottKirvan/BojuVue/issues/24) | Medium | Missing edge-case tests in `platform.test.ts` |
| [#25](https://github.com/ScottKirvan/BojuVue/issues/25) | Low | No abort/unmount guard on the manifest fetch |
| [#26](https://github.com/ScottKirvan/BojuVue/issues/26) | Medium | Export `detectPlatform`/`resolveDownload`/`defaultLabels` from the package |
| [#27](https://github.com/ScottKirvan/BojuVue/issues/27) | Medium | Decouple from `vitepress`'s `useData()` |
| [#28](https://github.com/ScottKirvan/BojuVue/issues/28) | Low | Customizable/branded default labels |
| [#32](https://github.com/ScottKirvan/BojuVue/issues/32) | Low | Margin baked into the component instead of caller-owned spacing |

#27 and #26 are effectively superseded/subsumed by the architecture below —
close them out (or link them) once PR 5 (the architectural split) lands
rather than fixing them in place on the current single-component shape.

## Where this is going

### 1. Naming

- **`BV` prefix on every BojuVue component and exported type** — matching
  VitePress's own `VP` convention as it's actually applied there —
  checked, and VitePress doesn't prefix uniformly: `VPButton`/`VPHero` etc.
  get the prefix, but its composables don't (`useData`, `useRoute`, not
  `useVPData`). We're following that same split, not a blanket
  "every export": PascalCase things (components, types) get `BV`; camelCase
  composables/functions/constants (`detectPlatform`, `resolveDownload`,
  `defaultLabels`) stay exactly as named, unprefixed. Decided explicitly —
  a bare `BV` glued onto a camelCase name reads like a typo
  (`BVdetectPlatform`), not a name.
- **Rename away from "Download."** The underlying mechanism — detect
  platform, resolve to a value — isn't inherently download-specific (see
  "Other use cases" below), and the name shouldn't imply it is.
  Component name: **`BVPlatformButton`** — used for *both* the core and the
  VitePress adapter (see the split below). They don't need distinct names:
  the import path is the scoping mechanism (`bojuvue` vs
  `bojuvue/vitepress`), the same way two files can each export
  something called the same thing with zero collision. On the rare occasion
  both are needed in the same file, standard import aliasing resolves it
  (`import { BVPlatformButton as BVPlatformButtonCore } from 'bojuvue'`);
  without aliasing, importing both unaliased in one file is a hard
  compile-time "duplicate identifier" error, not a silent runtime bug — so
  there's no real risk in sharing the name. Related renames to do in the
  same pass for consistency, types included per the rule above:
  `PlatformId` → `BVPlatformId`, `PlatformEntry` → `BVPlatformEntry`,
  `DownloadManifest` → `BVPlatformManifest`; default manifest filename
  `downloadButton.json` → `platformButton.json`-ish (filenames aren't code
  identifiers, so the `BV`-prefix rule doesn't apply to it either way).

### 2. Use `VPButton` instead of duplicating its CSS

VitePress exports `VPButton` from `vitepress/theme` publicly (confirmed via
its actual exports and `theme.d.ts` — not a private/internal reach). The
VitePress-aware component should render through `VPButton` internally
instead of hand-copying its CSS variables into `.bv-download-button`. This
also gives a natural home for the spacing fix in #32: spacing between
buttons/rows is a caller/layout concern (flex + `gap`, or a wrapper at the
call site), not something the button bakes into itself.

`VPButton`'s full prop surface: `text`, `href?`, `target?`, `rel?`, `tag?`,
`size?: 'medium' | 'big'`, `theme?: 'brand' | 'alt' | 'sponsor'`. `text` and
`href` are already covered — `BVPlatformButton` resolves those itself
(`resolveDownload`'s `label`/`href`) and passes the result through. Decided
for the rest:

- **`theme`, `size`** — plain styling, pass through as `BVPlatformButton`
  props with no change in meaning. No reason not to expose these.
- **`target`, `rel`** — pass through as *optional* props, left undefined by
  default so `VPButton`'s own smart defaults apply (auto `target="_blank"`
  + `rel="noreferrer"` when the resolved `href` is external, which is the
  common case for a platform-specific download/store link). Exposing them
  lets a caller override that when they genuinely want to.
- **`tag`** — not exposed as a public prop, but used internally: `VPHero.vue`
  (VitePress's own hero buttons) passes `tag="a"` explicitly even though
  `href` is already given, which is otherwise redundant under `VPButton`'s
  own auto-detection (`props.tag || (props.href ? 'a' : 'button')`) —
  because an *empty-string* `href` is falsy in JS, and without forcing
  `tag="a"`, that auto-detection would silently render an inert `<button>`
  instead of a broken-but-still-a-link `<a>`. `BVPlatformButton`'s `href`
  comes from resolved logic (`resolveDownload`), not a hand-written string,
  so the same risk applies — should hardcode `tag="a"` internally when
  calling `VPButton`, same defensive reasoning VitePress itself uses. Not
  exposed to `BVPlatformButton`'s own consumers as a prop — no identified
  case where someone using it would want a non-link element.

`VPButton` itself has no icon support at all (no icon prop, no slot — its
template only ever renders `{{ text }}`), so this isn't a `VPButton`
pass-through prop, but worth adding as a `BVPlatformButton`-only addition:

- **`icon?: string`** — raw SVG markup, rendered via `v-html` next to the
  label. Direct precedent already in VitePress itself: home-page
  `features[].icon` accepts a plain string and renders it exactly the same
  way (`<div v-else-if="icon" class="icon" v-html="icon"></div>` in
  VitePress's own `VPFeature.vue`). Same trust model applies — fine as long
  as `icon` stays a caller-supplied prop (something a site author writes),
  not something pulled from the fetched manifest; `v-html` renders whatever
  it's given with zero escaping, so it'd need the same trust as `href`
  values if it ever became manifest-driven.

### 3. Split into a core component and a VitePress adapter

Two components instead of one:

- **A generic core** — plain props in (`href`, `label`, or a pre-resolved
  manifest + detected platform), no `vitepress` import anywhere in its
  module. Works in any Vue 3 app, VitePress or not.
- **A thin VitePress adapter** (`BVPlatformButton`) — calls `useData()`,
  reads `site.value.base`, hands it to the core component. A few lines, no
  real logic of its own beyond that.

**Keeping both in the same package without creating a hard dependency for
non-VitePress consumers requires two things together, not one:**

1. `vitepress` becomes an *optional* peer dependency
   (`peerDependenciesMeta: { vitepress: { optional: true } }`) — handles the
   install-time half.
2. **Separate build outputs**, exposed as separate subpath imports — both
   named `BVPlatformButton`, disambiguated by the import path itself:
   ```ts
   import { BVPlatformButton } from 'bojuvue'            // core — no vitepress anywhere in this file
   import { BVPlatformButton } from 'bojuvue/vitepress'  // adapter — this one imports vitepress
   ```
   This is the part that actually matters — (1) alone doesn't help if both
   components still compile into one physical `dist/bojuvue.js`, since a
   consumer importing anything from that one file would still load a
   top-level `import 'vitepress'` statement and fail to resolve it. Needs
   two entries in `vite.config.ts`'s `build.lib.entry` and a `package.json`
   `exports` map with both `.` and `./vitepress`.

### 4. Other use cases for the platform-detection primitive

Discussed as future direction, not commitments yet. Most reuse
`detectPlatform`/`BVPlatformId` directly rather than needing new detection
logic:

- **Keyboard shortcut display** — `⌘K` vs `Ctrl+K` for search/command-palette
  hints. Common on docs sites (Vercel, Linear, Algolia DocSearch all do
  this). Low effort, likely the next concrete win after the split.
- **Install/setup instructions that branch by OS** — package manager
  commands (`brew install` / `winget install` / `apt install`), environment
  variable syntax. A content-branching helper, not a button — different
  shape from `BVPlatformButton`.
- **Browser extension store links** — Chrome Web Store / Firefox Add-ons /
  Edge Add-ons / Safari Extensions. Structurally identical to the existing
  download-link problem; would reuse the manifest/resolve pattern as-is.
- Considered and explicitly out of scope for now: PWA install prompting
  (genuinely different behavior per platform, not just a swapped value) and
  deep-linking into OS settings — more app-specific than something a shared
  component library should generalize.

## Development plan — 7 PRs

Planned as 7 separate PRs, not abstract phases — each one is a real,
reviewable unit with its own tests and docs updates included (per the
Definition of Done in `CLAUDE.md`; "tests" and "docs" are deliberately not
separate PRs at the end — that's the exact mistake this whole spec exists
to avoid repeating). Dependencies noted explicitly per PR: **hard**
dependencies mean the earlier PR's code has to exist first (branch from
it, not from `main`); **soft** dependencies are conflict-avoidance —
touching the same file in parallel branches, so sequencing them avoids a
messy merge rather than one being technically impossible without the other.

| PR | Depends on | Type |
| --- | --- | --- |
| 1. Naming | — | none |
| 2. `platform.ts` edge-case tests | PR 1 | soft |
| 3. Visual/API layer | PR 1 | soft (shares a file with PR 4) |
| 4. Correctness fixes | PR 1 | soft (shares a file with PR 2, and with PR 3) |
| 5. Architectural split | PR 1, PR 3, PR 4 | hard |
| 6. Test coverage for the split | PR 5 | hard |
| 7. Remove `HelloWorld` | — | none — fully independent, any time |

**1. Naming.** `BV` prefix on the component (`BVPlatformButton`) and its
exported types (`PlatformId` → `BVPlatformId`, `PlatformEntry` →
`BVPlatformEntry`, `DownloadManifest` → `BVPlatformManifest`) — composables
stay unprefixed (`detectPlatform`, `resolveDownload`, `defaultLabels`), per
the decided split above. Default manifest filename `downloadButton.json` →
`platformButton.json`-ish. **Deliberately does not touch `HelloWorld`** —
no point renaming a component that's being deleted in PR 7. *Tests:*
update existing test imports/references to the new names, no new test
cases. *Docs:* rename `docs/components/download-button.md`, update its
content, the sidebar entry in `docs/.vitepress/config.mts`, and the
`theme/index.ts` wiring. Touches nearly every file, so do it first —
everything else below is written against the new names.

**2. `platform.ts` edge-case tests ([#24](https://github.com/ScottKirvan/BojuVue/issues/24)).** The three missing cases:
default-`fallbackLabel` branch, `maxTouchPoints === 1` boundary, ChromeOS
with neither `chromeos` nor `android` present. *Tests:* this PR *is* the
tests. *Docs:* none needed. Branch from PR 1 (not stale `main`) so these
are written against the renamed files — if written before PR 1 lands,
PR 1 would need to touch this file too, redundant churn either way.

**3. Visual/API layer.** Render through `VPButton` internally instead of
the hand-rolled CSS; add `theme`, `size`, `target`, `rel`, `icon` props;
hardcode `tag="a"` internally; resolve [#32](https://github.com/ScottKirvan/BojuVue/issues/32) by moving spacing to the
caller. *Tests:* new cases for each added prop (theme/size class
application, icon `v-html` rendering, target/rel pass-through and
defaults). *Docs:* update the props table, add the manifest-`icon`
documentation, replace the spacing guidance now that it's caller-owned.
Shares `BVPlatformButton.vue` with PR 4 — sequence them, don't develop in
parallel, to avoid conflicting edits to the same file.

**4. Correctness fixes.** [#19](https://github.com/ScottKirvan/BojuVue/issues/19) (UA fallback for desktop detection),
[#20](https://github.com/ScottKirvan/BojuVue/issues/20) (absolute-URL support in `manifestUrl`). *Tests:* new cases
covering the UA-fallback detection paths and an absolute-URL manifest
fetch. *Docs:* update the manifest-file section for absolute-URL support;
the Platform Detection section's ordering notes stay accurate but should
mention the new UA fallback. Shares `platform.test.ts` with PR 2 (land
PR 2 first) and `BVPlatformButton.vue` with PR 3.

**5. Architectural split.** Core + VitePress adapter, subpath exports,
`vitepress` as an optional peer dependency, two `vite.config.ts` build
entries. Hard dependency on PR 1 (final names), PR 3 (final prop
shape/`VPButton` wrapping — splitting before the shape is settled means
redesigning props in two files instead of one), and PR 4 (relocating
already-correct fetch/detection logic instead of relocating-then-fixing
it). Resolves [#27](https://github.com/ScottKirvan/BojuVue/issues/27)/[#26](https://github.com/ScottKirvan/BojuVue/issues/26) outright (close or link them once this lands).
Fold in [#22](https://github.com/ScottKirvan/BojuVue/issues/22) (`res.ok` check), [#23](https://github.com/ScottKirvan/BojuVue/issues/23) (reactive `manifestUrl`), and [#25](https://github.com/ScottKirvan/BojuVue/issues/25)
(abort/unmount guard) here too — the fetch-orchestration code is getting
relocated into the core component regardless, so fixing these at the same
time avoids touching that logic twice. *Tests:* relocate/adapt existing
tests to the new module boundaries (this is largely superseded by PR 6's
dedicated coverage, but shouldn't ship broken in the interim). *Docs:*
document both import paths (`bojuvue` vs `/vitepress`) in the
component reference and the README.

**6. Test coverage for the split shape ([#21](https://github.com/ScottKirvan/BojuVue/issues/21)).** Dedicated test files for
both the core (mock `global.fetch`) and the VitePress adapter (mock
`vitepress`'s `useData`). Hard dependency on PR 5 — can't test components
that don't exist in the split shape yet. *Docs:* none new.

**7. Remove `HelloWorld`.** It was an export-and-preview exercise, not a
real library component — delete `src/HelloWorld.vue`,
`src/HelloWorld.test.ts`, its export in `src/index.ts`,
`docs/components/hello-world.md` and its entry in
`docs/components/index.md`'s table/sidebar, and its usage in `docs/index.md`'s
homepage demo (currently `<HelloWorld title="..." text="..." />` right
after the features block — needs removing, not just left dangling). *Tests:*
deletion, nothing new to add. *Docs:* deletion, plus the index/homepage
updates above. No dependency on anything else in this plan — different
files entirely, can happen in any order relative to PRs 1–6, including
first or last.

## Future backlog (not part of the 7 PRs above)

Not committed, not scheduled — pick up if/when there's an actual site that
wants one of these, not speculatively:

- The "other use cases" in the section above (keyboard shortcuts, install
  instructions, extension links).
- [#28](https://github.com/ScottKirvan/BojuVue/issues/28) (customizable default labels).

## Decided, not revisited

- **The `./vitepress` subpath re-exports everything the core package has**,
  plus its own VitePress-specific additions — `defaultLabels`,
  `detectPlatform`, `resolveDownload`, and the `BV`-prefixed types are all
  reachable from `bojuvue/vitepress`, not just `BVPlatformButton`
  itself. A VitePress site developer should never need to remember which of
  two paths a given export lives on; non-VitePress consumers are unaffected
  either way since they only ever import the bare package.
- **CPU architecture detection stays unsupported, permanently** — not a
  "revisit later" item. The reasoning is already documented in
  `docs/components/download-button.md`'s Limitations section (no reliable
  cross-browser signal exists today). Flagged explicitly as a good scope
  for an external contribution if someone wants to tackle it, rather than
  something on this project's own roadmap.
