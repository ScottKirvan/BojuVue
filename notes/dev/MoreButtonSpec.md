# BVMoreButton — Spec

Working document for a new component, not a refactor of anything existing. Captures
the design discussion (2026-08-27) so the sub-agent implementing it, and whoever
reviews the resulting PR, aren't relying on chat scrollback. Update in place if
anything here turns out to be wrong once real code exists.

## Origin

Obsidian's community plugin pages (see community.obsidian.md/plugins/<plugin>) put a
small `···` button next to the primary "Add to Obsidian" call-to-action. Clicking it
opens a dropdown panel of secondary outbound links — GitHub repo, report a bug,
request a feature, report the plugin — that don't deserve equal visual weight to the
primary CTA. Neither VitePress core nor this library has anything like it today:
VitePress's `nav`-with-`items` dropdown only lives in the top navbar (config-driven,
not placeable in page content), and `socialLinks` is an icon row, not a "..." trigger
with a panel of arbitrary links. This is a genuine gap, not a duplicate of an existing
feature — see the two reference screenshots attached to the originating conversation
(one desktop-width, one mobile-width) for the exact visual target.

## Decided

- **Name: `BVMoreButton`.**
- **Single implementation, no VitePress-specific variant.** Lives at
  `src/BVMoreButton.vue`, exported from `src/index.ts`, and re-exported (not
  reimplemented) from `src/vitepress.ts` — the same way `detectPlatform`/
  `resolveDownload`/etc. are today. `[Proposed — unconfirmed as an architectural
  pattern, though the "don't add VitePress-sourced convenience" half is confirmed]`:
  the component doesn't need `useData()` or any other VitePress API — it only ever
  renders the `items` it's given. An earlier idea floated in discussion — auto-sourcing
  menu items from the site's own `themeConfig.socialLinks` when no `items` prop is
  given, which would have justified a real second VitePress-aware implementation —
  was explicitly rejected ("good idea, but wrong tone"). Items are always passed in
  explicitly.
- **No manifest fetch, no async state, no platform detection.** Unlike
  `BVPlatformButton`, `items` is a plain synchronous prop. No loading state to design
  for.
- **Trigger renders as a real `<button>`**, not an `<a>` — it has no `href` of its own,
  it only toggles a menu.
- **Trigger visually matches `BVPlatformButton`**: `size?: 'medium' | 'big'` and
  `theme?: 'brand' | 'alt' | 'sponsor'` props, same meaning and defaults
  (`'medium'`/`'brand'`), so the two sit naturally side by side in an actions row.
  Per the existing precedent in this codebase (the generic `BVPlatformButton`
  hand-rolls its own CSS reading the same public `--vp-button-*` custom properties
  VitePress exposes, rather than sharing a stylesheet with anything) — `BVMoreButton`
  does the same: its own `<style scoped>` block reads the identical `--vp-button-*`
  variables with the identical fallback values, applied to a `<button>` instead of an
  `<a>`. Not a shared stylesheet between the two components; parity comes from both
  independently reading the same public tokens, matching how the existing two
  `BVPlatformButton` implementations already relate to each other.
- **Default trigger content**: a built-in three-horizontal-dot SVG icon (no visible
  text label) when no `icon` prop is supplied — matching the reference screenshots.
  `icon?: string` overrides it via `v-html`, same trust model as
  `BVPlatformButton.icon`: caller-supplied only, never fed anything dynamic/untrusted.
  `label?: string` (default `'More options'`) sets the trigger's `aria-label` — there
  is no visible text label either way, so the accessible name always comes from this
  prop, never from rendered content.
- **Menu items**: `items: BVMoreButtonItem[]` (required prop), each
  `{ label: string; href: string; icon?: string; target?: string; rel?: string }`.
  Rendered as real `<a role="menuitem">` elements (not `<button>` + JS navigation) so
  Enter-to-activate and middle-click/ctrl-click-to-open-in-new-tab work natively with
  zero extra code. `target`/`rel` per item default the same way
  `BVPlatformButton.target`/`.rel` already do: left unset so a smart external-link
  check (same `EXTERNAL_URL_RE` pattern) applies `target="_blank"` +
  `rel="noreferrer"` automatically, with an explicit prop value on the item overriding
  that. `icon` per item is optional, rendered via `v-html` the same way, same trust
  model (caller-authored `items` array, never fed unescaped user input).
- **ARIA / menu semantics** (WAI-ARIA menu button pattern): trigger gets
  `aria-haspopup="menu"` and `aria-expanded`; the panel is `role="menu"`; each item is
  `role="menuitem"`.
- **Keyboard behavior — exact, because retrofitting this later would be disruptive**:
  - Enter/Space on the trigger toggles the menu open/closed. This is native
    `<button>` behavior — no custom key handler needed for it.
  - `ArrowDown` while the trigger is focused and the menu is closed: opens the menu
    and moves focus to the first item. `ArrowUp` in the same state: opens and moves
    focus to the *last* item. (Standard menu-button convention — lets a keyboard user
    jump straight to "the last option" without arrowing through everything.)
  - While the menu is open, `ArrowDown`/`ArrowUp` move real DOM focus between menu
    items, wrapping at both ends (down from the last item goes to the first, and vice
    versa). `Home`/`End` jump to the first/last item.
  - `Escape` closes the menu from anywhere inside it and returns focus to the trigger.
  - Clicking/pointing down outside the component's own wrapper element closes the
    menu (no focus change).
  - Enter on a focused menu item navigates natively — it's a real anchor with real
    DOM focus, so no JS interception is needed or wanted.
  - Not handled, on purpose: no auto-close on window blur/tab switch, no special
    handling when a menu item is activated (normal browser navigation is enough for
    outbound links) — not asked for, and inventing state for it would be undecided
    behavior no one asked to see.
- **Placement/alignment algorithm.** Corrected after seeing it live (2026-08-28):
  the panel's **preferred alignment is leading-edge** — its left edge flush with the
  trigger button's left edge, opening "below and to the right," the conventional
  menu-button direction. `[Previously specified as trailing-edge-preferred, based on
  the two Obsidian reference screenshots — those showed the trigger sitting close to
  the right edge of its container, which is exactly the "flip" case below, not the
  general rule. On the actual homepage demo, where the trigger sits to the right of
  a primary CTA in the middle of the row, trailing-edge-preferred instead pulled the
  panel backward over the primary button. Corrected to leading-edge-preferred, with
  trailing-edge as the flip case for when the trigger is genuinely close to the right
  edge of the viewport — which is what the reference screenshots actually were.]`
  Content still has to stay on screen at any viewport width, so the chosen alignment
  is computed at open time, not hardcoded as pure CSS:
  1. Try leading-edge: `panelLeft = triggerLeft`. Use it if
     `panelLeft + panelWidth <= viewportWidth` (doesn't clip past the right edge).
  2. Otherwise flip to trailing-edge: `panelLeft = triggerRight - panelWidth`. Use it
     if `panelLeft >= 0` (doesn't clip past the left edge of the viewport).
  3. Otherwise (panel wider than the space available in either direction — a very
     narrow viewport) clamp: `panelLeft = max(0, viewportWidth - panelWidth)`.
  Recomputed every time the menu opens, and on window resize **and scroll** while
  it's open. Scroll matters as much as resize here: the panel is rendered
  `position: fixed` (viewport coordinates, the simplest way to satisfy this
  algorithm without offset-parent/scroll-position math), so without recomputing on
  scroll it would stay fixed in place while the trigger scrolled out from under it —
  caught in review after the initial implementation only handled resize.
- **Logic extraction, per this repo's testing convention**: the placement algorithm
  above and the keyboard index-stepping (`ArrowDown`/`ArrowUp`/`Home`/`End` →
  next-focused-index, given the current index and item count) must each be a pure,
  DOM-free, plain-`.ts` function with direct unit tests — not covered only indirectly
  by mounting the component. Mirrors `src/platform.ts` next to `BVPlatformButton.vue`.
- **No self-margin.** Same as `BVPlatformButton` (#32) — spacing between this
  component and its neighbors (the primary CTA button, etc.) is a caller/layout
  concern, not baked in.

## Open to the implementer's judgment ("how," not "what")

- Exact CSS class names, as long as they follow the existing `bv-*` naming
  convention and visual parity with `BVPlatformButton`'s button skin is real (reading
  the same `--vp-button-*` custom properties with the same fallback values), not just
  approximate.
- Whether the external-link detection regex (`EXTERNAL_URL_RE`, currently private to
  `BVPlatformButton.vue`'s `<script setup>`) gets extracted into a small shared
  module (e.g. `src/url.ts`, exporting something like `isExternalUrl(href): boolean`)
  that both components import, or is simply duplicated into `BVMoreButton`'s own
  logic module. `[Proposed — unconfirmed]`: extraction is the better long-term shape
  (two components now need identical logic — "sharing a utility," per CLAUDE.md's
  `useManifestFetch` precedent, not one component owning the other), but it touches
  an already-shipped file. Acceptable either way; if extracting, `BVPlatformButton`'s
  existing test suite (`src/BVPlatformButton.test.ts`) must keep passing unchanged —
  behavior, not just structure, must be identical.
- Panel background/border/shadow styling — should read VitePress's public `--vp-c-*`
  design tokens with sensible fallback values (same fallback-value discipline as the
  button skin), but exact token choices and visual polish are the implementer's call.
- Internal component structure (a composable vs. inline `<script setup>` logic),
  provided the two pieces of logic named above end up as pure, separately-tested
  functions.
- z-index / stacking approach for the panel, whatever actually works layered over
  typical page content in `docs/`'s live preview.

## File layout

- `src/BVMoreButton.vue` — the component.
- `src/BVMoreButton.types.ts` — `BVMoreButtonItem`, `BVMoreButtonProps` (mirrors
  `BVPlatformButton.types.ts`, kept out of the `defineProps<T>()` macro position per
  CLAUDE.md's cross-file-type constraint — the macro's inline type must duplicate
  this shape, not import it).
- `src/moreButtonMenu.ts` (naming the implementer's call) — the two pure functions
  from "Logic extraction" above, plus their types.
- `src/moreButtonMenu.test.ts` — direct unit tests for those pure functions,
  covering: trailing-edge fits; trailing-edge clips so it flips to leading-edge;
  neither fits so it clamps; keyboard stepping from every meaningful starting index
  including wrap-around at both ends, and the "opening state" (`ArrowDown`/`ArrowUp`
  on the trigger before any item has focus).
- `src/BVMoreButton.test.ts` — component-level tests: renders trigger with default
  vs. custom icon, `aria-*` attributes present and correct, items render as
  `role="menuitem"` anchors with resolved target/rel (default + override), opens/
  closes on trigger click, closes on Escape with focus returned to the trigger,
  closes on outside click, theme/size classes apply the same way
  `BVPlatformButton.test.ts` already checks for that component.
- `docs/components/more-button.md` — props table + usage example, same structure as
  `docs/components/platform-button.md`. Link it from `docs/components/index.md`'s
  table and `docs/.vitepress/config.mts`'s sidebar.

## Explicitly out of scope for this pass

- Any VitePress-aware convenience (auto-populated items from `socialLinks` or
  anything else read from `useData()`) — rejected above, not deferred.
- Nested/submenu items — every item is a flat, single-level link.
- Any kind of manifest/remote-fetched items — `items` is always a plain prop the
  caller already has in hand.
