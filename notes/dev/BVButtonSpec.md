# BVButton / BVIconButton — Spec

Working document for two new primitives and a refactor of the two existing
button-shaped components to sit on top of them. Captures the design discussion
(2026-08-28) so whoever implements this, and whoever reviews the resulting PRs,
aren't relying on chat scrollback. Update in place if anything here turns out to be
wrong once real code exists.

## Origin

Building `BVMoreButton`'s VitePress-specific implementation (see
`notes/dev/MoreButtonSpec.md`) surfaced two things:

1. **Real, demonstrated duplication.** The exact same `--vp-button-*`-reading
   button-skin CSS (medium/big × brand/alt/sponsor) is hand-copied in three places:
   `BVPlatformButton.vue` (generic), `BVMoreButton.vue` (generic), and was about to
   become a fourth copy inside `BVMoreButton`'s VitePress-specific icon-only branch.
   None of these are VitePress-specific — they're all just "render a button that
   looks like `VPButton` without depending on `vitepress`."
2. **A reusable branching pattern.** Rendering a button-like thing that sometimes
   needs to be a real `VPButton` (when it has visible text — `VPButton` has a
   real, useful theming/behavior contract there) and sometimes can't be (an
   icon-only button — `VPButton`'s `text` prop is required and it has no icon prop
   or slot, so forcing it into a fixed circular shape means fighting its box model
   with CSS overrides, not actually using it) isn't specific to a dropdown trigger.
   It's the same shape `BVPlatformButton` would want too, if it ever needed an
   icon-only mode.

Rather than let a PR ship `BVMoreButton`-specific VPButton-wrapping logic that
would immediately need ripping out, this spec pulls the shared primitive out first:
a plain `BVButton` (exactly `VPButton`-shaped, nothing else) and `BVIconButton`
(a `BVButton` that also takes an icon) — both real components, both with the usual
generic/VitePress-specific split — that `BVPlatformButton` and `BVMoreButton` (and
any future button-shaped component) delegate to instead of each owning their own
skin and VPButton-wrapping logic.

The PR that had already built and tested `BVMoreButton`'s direct-VPButton-wrap
(#47) was closed unmerged rather than landed-then-superseded; its logic and test
cases get adapted into `BVButton`/`BVIconButton` directly instead of rebuilt from
scratch.

## Decided

### `BVButton` — the minimal primitive

- **Props: `text: string` (required), `href?: string`, `target?: string`,
  `rel?: string`, `size?: 'medium' | 'big'`, `theme?: 'brand' | 'alt' | 'sponsor'`.**
  Deliberately exactly `VPButton`'s own prop shape (see
  `node_modules/vitepress/dist/client/theme-default/components/VPButton.vue`) —
  the whole point of this component is "a `VPButton`-equivalent that works outside
  VitePress too," so it shouldn't grow anything `VPButton` itself doesn't have. No
  `icon` here — that's `BVIconButton`'s entire reason to exist (see below), kept out
  of `BVButton` specifically so someone reaching for "just a button" sees a prop
  table exactly as unintimidating as adopting `VPButton` itself, not one cluttered
  with icon-only sizing or sibling-icon concerns they don't need.
- **`href`-driven tag auto-detection, matching `VPButton` exactly**: renders as
  `<a>` when `href` is given, `<button>` otherwise (`tag || (href ? 'a' : 'button')`,
  same as `VPButton`'s own `component` computed). A `tag?: string` escape hatch
  exists (needed internally — see `BVPlatformButton`'s current reasoning for
  forcing `tag="a"` when a resolved `href` could theoretically be an empty string)
  but isn't a heavily-documented top-level prop, mirroring how `VPButton`'s own
  `tag` prop is already treated in `platform-button.md` ("not exposed to
  `BVPlatformButton`'s own consumers as a prop").
- **Two implementations, matching `BVPlatformButton`'s existing split:**
  - `src/BVButton.vue` (generic) — hand-rolled `<component :is="...">`,
    consolidating the button-skin CSS currently duplicated across
    `BVPlatformButton.vue` and `BVMoreButton.vue`'s generic implementations into
    one place. Reads `--vp-button-*` custom properties with fallback values (must
    still look like a button outside VitePress).
  - `src/vitepress/BVButton.vue` (VitePress-specific) — thin wrapper rendering
    real `<VPButton>` with every prop passed straight through. No fallback values
    needed (only ever runs inside a real VitePress site).

### `BVIconButton` — `BVButton` plus an icon

- **Wraps `BVButton` via real composition, not a re-export/alias.** An alias
  (`export { default as BVIconButton } from './BVButton.vue'`) would leave `icon`
  sitting in `BVButton`'s own prop type, undermining the whole reason for splitting
  the name out. `BVIconButton` is its own component that renders a `BVButton`
  internally (from whichever import path it itself belongs to — see below) and
  adds icon handling around it.
- **Props: everything `BVButton` has, plus `icon?: string`** (raw SVG via
  `v-html`, same trust model as `BVPlatformButton.icon` today — caller-supplied
  only). `icon` is optional, not required: with no `icon` given, `BVIconButton`
  behaves exactly like a plain `BVButton` — `[Proposed]` this is what lets
  `BVPlatformButton`/`BVMoreButton` (see below) delegate to `BVIconButton`
  unconditionally rather than branching between two different child components
  depending on whether a particular instance happens to have an icon.
- **Icon-only vs. icon+text, same rule `BVMoreButton` already established**: with
  no `text`, renders icon-only at a fixed circular size (`size` still selects
  medium/big, same pixel dimensions `BVMoreButton` uses today); with `text`, the
  icon (if given) renders as a sibling before the button, not inside it — same
  workaround `BVPlatformButton` already uses for its own `icon` prop, for the same
  reason (`VPButton`, when the underlying `BVButton` is the VitePress-specific one,
  still has no slot to put it in).
- **`aria-label` handling lives here, not in each caller.** `[Proposed]` "an
  icon-only button needs an accessible name from a prop; an icon+text button
  already has one from its visible text" is a generic icon-button accessibility
  rule, not something specific to `BVMoreButton` — so `BVIconButton` itself takes
  an `ariaLabel?: string`, applied only when `text` is unset. `BVMoreButton`'s own
  default of `'More options'` and its default three-dot icon stay `BVMoreButton`'s
  own concern (passed in as `icon`/`ariaLabel` values), not baked into
  `BVIconButton` itself — `BVIconButton` has no opinion on what a sensible default
  icon or label is for any particular caller.
- **Two implementations, one with a deliberate cross-import:**
  - `src/BVIconButton.vue` (generic) — wraps the generic `BVButton` for both
    icon-only and icon+text modes. No `VPButton`-vs-hand-rolled conflict here at
    all: both modes render through the same hand-rolled `BVButton`, which is CSS
    this codebase owns outright, so an icon-only circular variant is just another
    modifier class on top of it — nothing to fight.
  - `src/vitepress/BVIconButton.vue` (VitePress-specific) — for **icon+text**
    mode, wraps `src/vitepress/BVButton.vue` (real `VPButton`) with the icon as a
    sibling, same as `BVPlatformButton`'s VitePress build does today. For
    **icon-only** mode, it does **not** wrap the VitePress `BVButton` — instead it
    imports and reuses `../BVButton.vue` (the *generic*, hand-rolled one) for
    exactly the same reason `BVMoreButton`'s VitePress implementation currently
    hand-rolls its own icon-only markup: no benefit to forcing `VPButton` into a
    shape it has no concept of, and here there's no need to re-implement that
    hand-rolled CSS a second time — it already exists one file over. This is a
    deliberate, one-directional exception to "the VitePress entry can depend on
    `vitepress`, the bare entry never does": a VitePress-specific file importing a
    generic file is always fine (the generic file still has zero `vitepress`
    dependency of its own); it's only the reverse that's forbidden.

### `BVPlatformButton` and `BVMoreButton` become consumers, not owners

- **`BVPlatformButton`** keeps its existing two-implementation split exactly as
  it is today — that split is about `useData().site.base` resolution, unrelated to
  this refactor. What changes is its last step: instead of owning `<a>` markup +
  CSS (generic) or rendering `<VPButton>` directly (VitePress), each
  implementation renders through `BVIconButton` (from its own matching import
  path), passing `text` (the resolved label), `href`, `target`, `rel`, `size`,
  `theme`, and `icon` straight through. `[Proposed]` always through
  `BVIconButton`, never conditionally through bare `BVButton`, per the
  optional-`icon` reasoning above.
- **`BVMoreButton`** keeps all of its own logic (items/menu panel, keyboard
  handling, placement algorithm, open/close state) exactly as-is — none of that is
  button-skin concern. Only the trigger changes: both implementations render a
  single `<BVIconButton>` (from their own matching import path) with `text`,
  `icon` (`resolvedIcon`), `size`, `theme`, `aria-haspopup`, `aria-expanded`,
  `aria-label` (icon-only only), `@click`, and `@keydown` — the same fallthrough
  pattern already verified to work through one layer of wrapping (`BVMoreButton` →
  `VPButton`) in the now-closed #47; needs re-verification through two layers
  (`BVMoreButton` → `BVIconButton` → `BVButton` → `VPButton`) once built, but
  Vue's attrs/`$el` fallthrough is transitive by design, so this is expected to
  keep working, not a known risk. Both `BVMoreButton` implementations lose their
  entire hand-rolled button-skin `<style>` block — that CSS now lives exactly once,
  in `BVButton.vue`.

## Open to the implementer's judgment ("how," not "what")

- Exact prop name for `BVIconButton`'s accessible-name prop (`ariaLabel`,
  `label`, something else) — `BVMoreButton.label` already exists and means this
  exact thing, so whichever name is chosen, keep the meaning identical.
- Whether `BVButton`/`BVIconButton` get their own dedicated doc pages (mirroring
  `platform-button.md`/`more-button.md`) or a shared "primitives" page — either is
  fine as long as both are documented with a full props table and a usage example,
  per this repo's Definition of Done.
- Whether the `tag` escape hatch on `BVButton` is typed as a narrow union
  (`'a' | 'button'`) or a plain `string` (matching `VPButton`'s own untyped
  `string`) — `VPButton`'s own choice is a reasonable default to just match.
- Test file organization — one test file per new component per implementation
  (matching existing convention: `BVButton.test.ts`, `vitepress/BVButton.test.ts`,
  etc.) is the expected shape, but exact case breakdown is implementation-driven.
- Whatever internal CSS class names `BVButton`/`BVIconButton` render (e.g.
  whether `BVMoreButton`'s trigger still has a class literally named
  `bv-more-button-trigger` after delegating) — nothing external depends on these
  class names today (pre-1.0, no other published consumer), so there's no
  backward-compatibility constraint forcing them to stay the same; existing tests
  asserting on old class names get updated to match whatever `BVButton`/
  `BVIconButton` actually render, not preserved artificially.

## File layout

- `src/BVButton.vue`, `src/BVButton.types.ts`, `src/BVButton.test.ts`
- `src/vitepress/BVButton.vue`, `src/vitepress/BVButton.test.ts`
- `src/BVIconButton.vue`, `src/BVIconButton.types.ts`, `src/BVIconButton.test.ts`
- `src/vitepress/BVIconButton.vue`, `src/vitepress/BVIconButton.test.ts`
- `src/index.ts` / `src/vitepress.ts` — export all four new pieces
- `docs/components/button.md` and/or `docs/components/icon-button.md` (naming per
  the implementer's judgment above), linked from `docs/components/index.md` and
  `docs/.vitepress/config.mts`'s sidebar/nav dropdown
- Modified: `src/BVPlatformButton.vue`, `src/vitepress/BVPlatformButton.vue`,
  `src/BVMoreButton.vue`, `src/vitepress/BVMoreButton.vue` — delegate their
  rendering to `BVIconButton` instead of owning markup/CSS; existing test files
  for both updated to match (behavior-preserving — the props and documented
  behavior of `BVPlatformButton`/`BVMoreButton` themselves don't change, only how
  they render internally)

## PR sequence

Proposed as 4 separate PRs — each a real, reviewable, independently-mergeable
unit with its own tests and docs, per this repo's Definition of Done (see the
7-PR breakdown in `notes/dev/PlatformButtonSpec.md` for the precedent this
follows).

| PR | Depends on | Type |
| --- | --- | --- |
| 1. `BVButton` | — | `feat` |
| 2. `BVIconButton` | PR 1 | `feat` |
| 3. `BVPlatformButton` delegates to `BVIconButton` | PR 2 | `refactor` |
| 4. `BVMoreButton` delegates to `BVIconButton` | PR 2 | `refactor` |

PRs 3 and 4 are independent of each other (different files) and could be done in
either order, or combined into one PR if that reads more clearly — flagging the
split as the default rather than a hard requirement.

**1. `BVButton`.** Both implementations, both test files, docs page. No existing
component changes yet — this PR is purely additive.

**2. `BVIconButton`.** Both implementations (including the generic-file
cross-import from the VitePress-specific icon-only branch), both test files, docs
page. Hard dependency on PR 1. Folds in #47's already-written VPButton-wrap test
cases (adapted to `BVIconButton`'s shape) rather than rebuilding them.

**3. `BVPlatformButton` refactor.** Both implementations re-rendered through
`BVIconButton`. *Tests:* existing `BVPlatformButton.test.ts` /
`vitepress/BVPlatformButton.test.ts` suites must keep passing — this is a
behavior-preserving refactor of the most mature, already-published component, so
this PR is exactly "make the internals different, make the outputs identical."
*Docs:* `platform-button.md` gets a short note that it renders through
`BVIconButton` internally, but its own props/behavior documentation shouldn't
need substantive changes.

**4. `BVMoreButton` refactor.** Both implementations' trigger re-rendered through
`BVIconButton`, dropping their own button-skin CSS entirely. *Tests:* existing
`BVMoreButton.test.ts` / `vitepress/BVMoreButton.test.ts` suites adapted to
whatever `BVIconButton` actually renders (class names may change — see "Open to
the implementer's judgment" above) but must keep asserting the same
externally-visible behavior (keyboard nav, placement, open/close, item
rendering — none of which touches the trigger's own rendering). *Docs:*
`more-button.md` gets the same short "renders its button through `BVIconButton`"
note as `platform-button.md`.
