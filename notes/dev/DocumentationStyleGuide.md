# Documentation Style & Voice Guide

Governs `docs/**/*.md` (the published VitePress site) and, where noted, the README.
Written up after a full pass over the VitePress docs rewrite, incorporating the
original voice brief plus every correction made against it turn by turn. If you're
writing or reviewing docs for this repo, read this first — and if you find a violation
this guide doesn't already name, add it here rather than fixing it silently once.

---

## 1. Voice & Persona

- **Senior peer-to-peer.** Write like an experienced engineer explaining a decision to
  another competent engineer — not a tutorial voice, not talking down. Assume the
  reader knows standard programming basics; spend words on the specifics of *this*
  tool, not general concepts.
- **Pragmatic and production-hardened.** Surface real tradeoffs, failure modes, and
  limits — not an idealized happy path. "CPU architecture isn't detected, and can't be
  reliably detected client-side across browsers today" is the right register; a
  features list that never mentions where something falls apart is not.
- **Direct and unfluffy.** Get to the mechanism, prop, or code as fast as possible. No
  throat-clearing ("In this section, we'll explore..."), no marketing buzzwords
  ("seamless," "powerful," "revolutionary").
- **Dry, grounded wit — rare, and never forced.** A little personality is fine where it
  falls out naturally; don't manufacture it. Most pages in this repo won't have room
  for it, and that's fine — technical precision outranks it every time.

## 2. Formatting

- Inline-code file paths, flags, props, variables, and short syntax (`fallbackHref`,
  `.vitepress/theme/index.ts`, `--vp-button-*`).
- **Callout taxonomy**, used sparingly, only for genuinely critical non-linear
  information — not decoration:
  - **Note** → VitePress `::: info` (VitePress has no literal `note` container).
  - **Tip** → `::: tip`.
  - **Warning** → `::: warning`.
  - A page with zero callouts is fine. A page with a callout on every paragraph means
    none of them are actually calling anything out.
- **Code examples must be idiomatic and complete**, and must show the failure/edge
  path alongside the happy path where one exists — e.g. `BVPlatformButton`'s usage
  examples show both "hides itself on an unmatched platform" and "always shows
  something" as two full, separate blocks, not one example with the edge case merely
  described in prose.

## 3. Say only what's verified

The single most common defect this session found: prose asserting something that
sounded plausible but wasn't checked against the actual code, config, or CI.

- **Don't invent narrative or motivation.** "It exists to solve one specific problem"
  was cut — it was dramatized backstory, not a verified fact, and irrelevant to someone
  reading install docs anyway. Say what the thing does. If a real "why" is worth
  including, it must be something you can point at (a comment, a spec, the author's own
  words) — not a plausible-sounding guess.
- **Don't claim automation that isn't automated.** A homepage feature card claimed the
  "generic build has zero vitepress" invariant was "verified... on every change" — it
  wasn't; there's no CI step for it, only a documented manual grep. Say what's actually
  true: a documented practice, not a guarantee, unless a check enforces it.
- **Don't invent causality between siblings.** "Same scale as `BVPlatformButton`'s
  `size`, so the two sit naturally side by side" implies `BVPlatformButton` is the
  *reason* — a causal story the reader can't verify and shouldn't need to. State each
  component's own behavior directly; mention a sibling only as a parallel fact ("the
  same tokens `BVPlatformButton` also reads"), never as a justification.
- **State exactly what's guaranteed — no more, no less.** Both directions of this
  failure showed up in the same session:
  - *Overclaiming automation* (above).
  - *Overclaiming a contract that's really just today's styling*: a prop-table row
    once said a button was "38px fixed size" instead of "38px circle" — technically
    vaguer, but *wrong* in the other direction, because the actual CSS is still a
    circle. The fix wasn't to restore "circle" as-is either — the shape is
    `border-radius`, an implementation detail free to change, not a documented
    contract. The right call was the one already on the page: name the current shape
    honestly *and* say explicitly it isn't guaranteed to stay that way. Don't round a
    real, specific fact down to something vaguer than the truth, and don't round an
    implementation detail up into a promise that was never made.

## 4. Know your audience — where content lives

Established mid-session after the Architecture section and the "Adding a new
component" walkthrough were found sitting on the public VitePress site — contributor
material, not something a consumer of the published package needed.

- **The VitePress docs site is for consumers of the published npm package only.** What
  a component does, its props, how to install and register it, its failure modes and
  usage examples. Nothing about this repo's own build system, internal file layout, or
  how to contribute.
- **The README (and `notes/dev/`) carry contributor/dev-process content.** Architecture
  rationale, the two-entry-point build, "Adding a new component," branch/commit
  conventions — all belong there, not on the published site.
- **Never point a consumer at something only usable from inside this repo's own
  checkout.** A demo section once told readers to "remove a platform's entry from
  `docs/public/platformButton.json` locally and reload" — a path that only exists in
  this repo, not in a consumer's project. Every instruction on the public site must be
  something the reader can actually do in *their own* app.
- **Never point a consumer at something that isn't part of the public API.** A
  component page once pointed readers at `computeMenuPanelLeft` in
  `src/moreButtonMenu.ts` as if it were reachable — it was never exported from either
  entry point. Naming an internal symbol in consumer docs promises availability that
  doesn't exist. Check the export before naming it as something the reader can use.

## 5. Don't write the docs VitePress-first

BojuVue supports plain Vue 3 apps as a first-class case, not a fallback — the docs
have to read that way too. A non-VitePress reader who hits three VitePress-only pages
in a row before finding anything for them concludes the library "isn't designed for
them" and leaves, whether or not that was ever true.

- **Lead with what's universally true.** The homepage hero used to read "Shared Vue 3
  components for VitePress sites" — the very first sentence excluded half the
  audience. Now: "Shared Vue 3 components," full stop, with VitePress named as one
  supported target, not the subject.
- **Give the generic path an equally complete worked example — not just an import
  line.** The Installation guide's entire "Registering components" walkthrough used to
  be VitePress-only (`enhanceApp`, `.vitepress/theme/index.ts`), with the plain-Vue
  path mentioned only as a bare import statement three sections later. It now leads
  with a full, real `createApp`/`app.component` example, with VitePress's `enhanceApp`
  shown afterward as *the same call, made from a different hook* — not a second-class
  alternative.
- **Cut language that implies unverified primacy.** Removed on sight wherever found:
  "the common case," "which this component was originally designed for," "use the bare
  package path *only if*...". Neutral phrasing ("use X when Y") states the same
  guidance without ranking one path above the other.

## 6. Cross-referencing

Two failure modes, both real, both found in the same review pass — the fix for one is
not "stop cross-referencing," it's "cross-reference correctly."

- **Never name a sibling page or symbol without linking to it if the reader would
  otherwise have to search for it.** "See `BVIconButton`'s own docs for how" — with no
  link anywhere on the page to `BVIconButton`'s docs — showed up repeatedly on brand
  new content in the same PR that introduced `BVIconButton` itself. If you mention a
  component whose own page has more detail, link it at the point that detail actually
  matters.
- **Don't defer a prop's *meaning* to another page just because the *value* matches.**
  `BVMoreButton`'s `size`/`theme` rows once said only "same meaning and default as
  `BVPlatformButton.size`" with no link — the reader had to go find and read
  `BVPlatformButton`'s page to learn what the value even did, for two components that
  don't depend on each other at all. State the prop's own effect on the component
  you're documenting; mention the sibling only as *additional* context (why the values
  were chosen to match), never as the sole source of the definition.
- **No self-referential links.** A prop-table row once said "— see [Props](#props)
  below" from *inside* the Props table itself — copy-pasted from an intro paragraph
  where the same phrase correctly pointed forward, now circular in its new home.
  Check what a link's target actually is relative to where you're placing it, not just
  whether the phrase reads right in isolation.
- **One real link per page, at first substantive mention, is enough.** Don't relink
  every occurrence of a component's name on the same page — that's noise, not
  navigation.

## 7. Terminology

- **Plain word over decorative jargon when they say the same thing.** `BVMoreButton`'s
  docs used "trigger" throughout to mean, plainly, "button." It's accurate
  UI-pattern terminology, but it bought nothing here — "button" says the same thing
  without requiring the reader to already know the pattern name. Replaced everywhere in
  prose; left alone in the two places it was a literal code identifier
  (`triggerLeft`/`triggerRight`), because renaming those in docs without renaming the
  code would just make the docs wrong (tracked instead as a real naming bug —
  [#46](https://github.com/ScottKirvan/BojuVue/issues/46)).
- **Reserve precise technical terms for real technical concepts** — "accessible name,"
  "modifier class," "prerender," "peer dependency" — not for whichever word sounds
  more impressive when a plain one already works.
- **Define a symbol on first use — never let it carry the sentence alone.** `'"···"'`
  trigger" told the reader nothing until they already knew the three-dot/kebab-menu
  convention. Lead with what it does in words; the glyph is a secondary visual detail,
  not the primary descriptor.

## 8. Before shipping a docs change

- Re-verify every claim against the actual code/config open in front of you, not
  memory of what a previous draft said or what "should" be true.
- For every internal example or instruction: could a reader actually do this in *their
  own* project, right now, with what's on the published npm package? If it only works
  inside this repo's own checkout, it doesn't belong on the public site.
- For every named function or sibling component: is it either fully self-contained
  right here, or reachable by one real link? "The reader can go find it" is not a
  substitute for a link.
- Build the docs site (`npm run docs:build` from `docs/`) — a dead internal link fails
  the build, so this alone catches a real class of the mistakes above.
- Run the library build and grep `dist/bojuvue.js` for `vitepress` if you touched
  anything under `src/` — the zero-`vitepress`-in-the-generic-build invariant is a
  hard requirement, not a docs concern, but a docs claim about it must match reality.
