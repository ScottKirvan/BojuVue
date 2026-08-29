# Documentation Style & Voice Guide

Portable rules for technical documentation, with O'Reilly's technical-writing voice as
the touchstone: precise, direct, peer-to-peer, production-honest. Not specific to any
one project — apply it to a component library, an API, a CLI, an internal service,
whatever's being documented. Where a rule references a mechanism (a build step, a
callout syntax, a link format), swap in whatever the target project actually uses; the
rule itself is what travels.

---

## 1. Voice & Persona

- **Senior peer-to-peer.** Write like an experienced engineer explaining a decision to
  another competent engineer — not a tutorial voice, not talking down. Assume the
  reader knows standard programming basics; spend words on the specifics of *this*
  system, not general concepts.
- **Pragmatic and production-hardened.** Surface real tradeoffs, failure modes, and
  limits — not an idealized happy path. If something can't be done reliably, or only
  works under specific conditions, say so plainly. A page that never admits where
  something falls apart isn't thorough, it's incomplete.
- **Direct and unfluffy.** Get to the mechanism, parameter, or code as fast as
  possible. No throat-clearing ("In this section, we'll explore..."), no marketing
  buzzwords ("seamless," "powerful," "revolutionary," "effortless").
- **Dry, grounded wit — rare, and never forced.** A little personality is fine where it
  falls out naturally from the material. Most pages won't have room for it, and that's
  fine — technical precision outranks it every time.

## 2. Formatting

- Inline-code file paths, flags, parameters, variables, and short syntax.
- **Use a callout taxonomy, sparingly, only for genuinely critical non-linear
  information — not decoration:**
  - **Note** — architectural nuance, historical context, a cross-platform difference.
  - **Tip** — a shortcut, an optimization, a convenience most readers would miss.
  - **Warning** — a production hazard, a breaking change, a silent-failure risk.
  - Map these to whatever your documentation tooling actually provides; if there's no
    exact match for one (many static-site generators have no literal "Note" container),
    the closest semantic equivalent is fine — don't invent markup the renderer doesn't
    support. A page with zero callouts is fine. A page with a callout on every
    paragraph means none of them are actually calling anything out.
- **Code examples must be idiomatic and complete, and must show the failure/edge path
  alongside the happy path where one exists** — not one example with the edge case
  merely described in prose after the fact. If a function can fail, show what calling
  code does about it, not just the call that works.

## 3. Say only what's verified

The most common way technical docs go wrong: prose that sounds plausible but was never
checked against the actual source of truth (the code, the config, the CI setup, the
API response).

- **Don't invent narrative or motivation.** "Built to solve X" is dramatized backstory
  unless you can point at something that actually says so — a comment, a spec, a
  changelog entry, the author's own words. If you don't have that, just describe what
  the thing does. A motivation story is also usually irrelevant to someone trying to
  use the thing, which is its own reason to leave it out.
- **Don't claim automation, process, or enforcement that isn't real.** If a rule is
  "checked" only by a human remembering to run a command, say that — don't describe it
  as verified, enforced, or automatic. Overstating rigor is worse than not mentioning
  the rigor at all, because a reader who trusts the claim stops checking for
  themselves.
- **Don't invent causality between two things that just happen to match.** "X and Y use
  the same default, so they work well together" is fine; "X uses this default *because*
  Y does" is an unverifiable story unless one component actually derives its value from
  the other. State each thing's own behavior on its own terms; mention a resemblance as
  a parallel fact, never as a justification you can't back up.
- **State exactly what's guaranteed — no more, no less.** This cuts both ways:
  - Don't round a real, specific, currently-true fact down into something vaguer than
    the truth (turning "returns a 400 with this exact error shape" into "may return an
    error").
  - Don't round an implementation detail up into a promise nothing actually makes
    (turning "currently rendered as a circle, because that's what this CSS rule
    produces today" into "is always circular" — a decision the underlying code never
    committed to and is free to change). When something is true today but not
    contractually guaranteed, say both halves: what's true now, and that it isn't a
    promise.

## 4. Know your audience — where content lives

Most projects have at least two real audiences reading overlapping material for
different reasons: people *using* the thing, and people *building or maintaining* it.
Docs that blur the two end up serving neither well.

- **User-facing docs are for people consuming the finished thing** — what it does, how
  to install/call/configure it, its failure modes, worked examples. Nothing about the
  maintainers' own build tooling, internal repo layout, or how to contribute, unless
  the audience for that specific page is explicitly contributors.
- **Contributor/internal docs carry the rest** — architecture rationale, build
  internals, "how to add a new X," commit/branch conventions. Keep this material out of
  user-facing pages even when it's genuinely interesting; it answers a question the
  user-facing reader didn't ask.
- **Never instruct a user to act on something that only exists in the maintainers' own
  environment.** An example that says "edit this local file and reload" only works if
  the reader has that exact file, at that exact path, in that exact project layout.
  Every instruction on a user-facing page must be something the reader can do in
  *their own* project, with what they actually have installed.
- **Never point a user at something that isn't part of the actual public interface.**
  If a function, class, or endpoint isn't exported, published, or otherwise reachable
  by a normal consumer, don't name it in user-facing docs as if it's something they can
  reach for. Check that a thing is genuinely public before documenting it as available.

## 5. Don't let an equally-supported path read as an afterthought

Many projects genuinely support more than one integration path, platform, or usage
mode as first-class — and the docs quietly contradict that by explaining one fully and
the other as a footnote. A reader who hits several pages in a row written for the
"wrong" case for them reasonably concludes the project isn't meant for them, whether or
not that's true.

- **Lead with what's universally true**, not with the framing of whichever path the
  author personally reaches for most. If a tool works standalone and also has special
  integration with a specific platform, the opening line shouldn't declare it as "a
  plugin for that platform" if standalone use is equally real.
- **Give every genuinely-supported path an equally complete worked example** — not a
  full walkthrough for one and a bare one-liner for the other three sections later.
  If two paths are both real, show both doing the same task, side by side or in
  clearly separate, equally-detailed sections.
- **Cut language that implies unverified primacy** without evidence: "the common
  case," "this is what it was originally built for," "use the alternative *only
  if*...". Neutral phrasing ("use X when Y, use Z when W") gives the same guidance
  without ranking one option as the default and the rest as exceptions.

## 6. Cross-referencing

- **Never name another page's subject, or a related function/type, without a real link
  if the reader would otherwise have to go search for it.** "See the X reference for
  details" with no link to X is not a cross-reference, it's a dead end.
- **Don't defer a concept's *meaning* to another page just because a *value* happens to
  match.** If two independent things share a default "by design parity" rather than
  because one derives from the other, explain each one's own effect where it's
  documented; a sibling mention belongs alongside that explanation as extra context,
  never as the only place the meaning lives.
- **No self-referential or circular links.** Before adding "see X below" or "see X's
  own docs," check what X actually resolves to relative to where you're placing the
  link — text copied from one location to another can turn a forward reference into a
  pointer at itself.
- **One real link per page, at the first substantive mention, is usually enough.**
  Relinking every occurrence of the same reference on one page is noise, not
  navigation.

## 7. Terminology

- **Reach for the plain word over decorative jargon when they say the same thing.** A
  precise pattern name ("trigger," "sentinel," "middleware") is worth using only when
  it actually carries information the plain word doesn't — otherwise it just requires
  the reader to already know the term. When in doubt, prefer the word a competent
  engineer outside this specific subfield would still understand on first read.
- **Reserve precise technical terms for real technical concepts** — use exact
  vocabulary where a concept genuinely has one ("idempotent," "backpressure," "atomic",
  "accessible name") — not for whichever synonym sounds more impressive when a plain
  one already works.
- **Define any symbol, abbreviation, or convention-dependent term on first use — never
  let it carry the sentence alone.** A raw glyph, an internal shorthand, or a pattern
  name assumed to be common knowledge tells a cold reader nothing. Lead with what it
  does in words; treat the shorthand as a secondary label, not the primary descriptor.

## 8. Before shipping a docs change

- Re-verify every claim against the actual current source of truth — code, config,
  API behavior, CI setup — not memory of a previous draft or what "should" be true by
  now.
- For every instruction or example: could the reader actually carry this out in
  *their own* environment, with only what's publicly available to them? If it only
  works inside the maintainers' own setup, it doesn't belong in user-facing docs.
- For every named function, type, or related topic: is it either fully explained right
  here, or reachable by one real, correctly-targeted link? "The reader can go find it"
  is not a substitute for a link.
- Render or build the documentation before calling it done, if the tooling supports
  it — a broken internal link, malformed callout, or dead cross-reference is often
  caught automatically and should never ship silently.
- If the docs make a claim about a system invariant (a build guarantee, a
  compatibility promise, a performance characteristic), verify that claim against the
  actual system one more time immediately before publishing — this is where stale
  claims most often slip through.
