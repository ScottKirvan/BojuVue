# Architecture

BojuVue's entire structure follows from one constraint: the generic build must have
**zero** dependency on `vitepress`, anywhere in its module graph. Everything else here
— the two entry points, the optional peer dependency, the two-implementation
component pattern — exists to make that constraint hold under a real bundler, not just
in theory.

## Two entry points, two physical files

`vite.config.ts` builds library mode with two separate entries:

| Entry | Output | Published as |
| --- | --- | --- |
| `src/index.ts` | `dist/bojuvue.js` | `@scottkirvan/bojuvue` (the `.` export) |
| `src/vitepress.ts` | `dist/vitepress.js` | `@scottkirvan/bojuvue/vitepress` |

`src/vitepress.ts` re-exports everything `src/index.ts` has, under the same names,
plus its own VitePress-specific component implementations — so a VitePress site
developer never has to remember which of the two paths a given export lives on;
importing from `/vitepress` alone is always enough.

::: warning Why this has to be two files, not two exports of one file
If both entries compiled into a single bundle, importing only the generic path would
still execute a top-level `import 'vitepress'` somewhere in that bundle — even if the
importing code never calls into it, the `import` statement itself is enough to pull
`vitepress` into a consumer's dependency graph and fail to resolve if `vitepress` isn't
installed. Two genuinely separate physical output files, `vue` and `vitepress`
external as peer dependencies, is what actually keeps the generic build clean.
:::

`vitepress` is an *optional* peer dependency (`peerDependenciesMeta`) — `npm install
@scottkirvan/bojuvue` alone never requires it. Only a project that also imports from
`@scottkirvan/bojuvue/vitepress` needs `vitepress` installed.

This is a hard invariant, not an implementation detail — verify it after touching
anything under `src/` by building and grepping the output for the literal string
`vitepress`:

```sh
npm run build
grep -r vitepress dist/bojuvue.js
# should print nothing
```

## The two-implementation component pattern

A component that needs anything VitePress-specific — site data, the router, VitePress's
own `VPButton` — doesn't take a runtime "VitePress mode" flag. It gets **two fully
independent implementations sharing one exported name**, disambiguated entirely by
import path:

- `src/ComponentName.vue` — plain props in, no `vitepress` import anywhere in the file,
  works in any Vue 3 app. Exported from `src/index.ts`.
- `src/vitepress/ComponentName.vue` — calls `useData()` (or whatever else it needs)
  itself and implements its own rendering. Exported from `src/vitepress.ts`.

Neither component imports or renders the other. `BVPlatformButton` is the worked
example:

- `src/BVPlatformButton.vue` takes a `base` prop and renders its own `<a>` with
  hand-rolled CSS that reads the same public `--vp-button-*` custom properties
  VitePress itself exposes for theming (with fallback values, so it still looks like a
  button outside VitePress).
- `src/vitepress/BVPlatformButton.vue` reads `useData().site.value.base` itself instead
  of taking it as a prop, and renders through VitePress's real `VPButton` — real theme
  styling, no CSS of its own beyond positioning an icon.

::: info Why not one component with a flag
A single component branching on `typeof window` or an injected flag would still need
to statically `import` both code paths — `vitepress`-dependent code included — into
one module, which is exactly the leak the two-entry-point split above exists to
prevent. Two independent files is what lets each Vite entry pull in only the code its
own consumers actually need.
:::

Where logic is genuinely shared between the two implementations, it lives in a plain
utility module both call independently — not in one component owning the other's
rendering. `useManifestFetch` (`src/useManifestFetch.ts`) is the shared fetch
orchestration behind `BVPlatformButton`'s manifest lookup: it takes a reactive URL
getter and handles the fetch/abort/re-fetch lifecycle, called separately by both the
generic and VitePress-specific components with their own way of deriving that URL.

A component with no VitePress-specific needs at all — `BVMoreButton`, for example —
just lives directly under `src/` with a single implementation, exported only from
`src/index.ts`. `src/vitepress.ts` re-exports it so it's still reachable from
`/vitepress`, but there's no second implementation to maintain.

## Where prop types live

`defineProps<T>()` type parameters stay written out **inline** in the `.vue` file,
never imported from another module.

::: warning A type import in this position breaks under this repo's docs build
`@vue/compiler-sfc` resolving a `defineProps<T>()` type that's imported from another
module needs the `typescript` package loadable from wherever the `.vue` file is being
compiled. `docs/`'s theme imports component source directly from the repo-root `src/`
(see below) using `docs/`'s own Vue/Vite install, which doesn't carry `typescript` as
its own dependency — that resolution only succeeds if the repo root's `node_modules`
also happens to be present. Keeping the type inline in the macro avoids the dependency
entirely.
:::

A type used only for a public, non-macro export — `BVPlatformButtonProps` in
`src/BVPlatformButton.types.ts`, for instance — is fine to keep in its own file. The
constraint is specifically about the `defineProps<T>()` type position.

## Logic lives outside the `.vue` file

Components with real logic — detection, data-shaping, anything beyond pure rendering —
extract that logic into a plain `.ts` module (`src/platform.ts` next to
`BVPlatformButton.vue` is the pattern) rather than keeping it inline in `<script
setup>`. It's much easier to unit test a plain function than to mount a component or
mock Vue-specific APIs to exercise the same branch. The `.vue` file stays a thin wiring
shell around it.

## `docs/`: live preview without publishing

`docs/` is a separate, independently-installed VitePress project that doubles as this
library's demo site. `docs/.vitepress/theme/index.ts` imports directly from
`../../../src/vitepress` — this repo's own VitePress-entry *source*, not the built or
published package — and registers every export globally. That's what lets a new
component show up in a real VitePress site the moment you write it, with
`npm run docs:dev` and no `npm publish` or `npm link` in between.

That import crosses a directory boundary `docs/`'s own dependency resolution doesn't
know about: files under repo-root `src/` still `import 'vue'` and `import 'vitepress'`
themselves, and left alone those imports would resolve relative to `src/`'s own
physical location — which may not have `vue`/`vitepress` installed, and even where it
does, `vitepress`'s `package.json` unconditionally maps its bare `.` export to a
Node build-time entry that breaks in a browser bundle.

`docs/.vitepress/config.mts` fixes this with a scoped Vite plugin: when the importing
file is physically under repo-root `src/`, resolution is redirected through Vite's
normal resolver as if the import came from inside `docs/` instead — reusing Vite's
real resolution algorithm (package.json export maps, conditions, everything) rather
than hand-aliasing each subpath that turns out to matter.

::: tip Verifying this plugin
Temporarily rename the repo root's `node_modules` out of the way and confirm `npm run
docs:build` (from `docs/`) still succeeds. If it only works with the root
`node_modules` present, the plugin isn't actually doing its job — `docs/`'s deploy job
never installs the repo root's dependencies.
:::

A real consuming site never hits any of this — it imports the already-built
`dist/bojuvue.js` (or `dist/vitepress.js`) from its own `node_modules`, with `vue` and
`vitepress` already resolved as externals at this repo's own build time. It's purely
internal to this repo's own dev-preview setup.

## Typechecking and build

`npm run build` runs `vue-tsc -b` (typecheck, via composite TypeScript project
references) and then `vite build` (emits `dist/`). There's no separate
typecheck-only script — `vue-tsc -b --noEmit` isn't valid with composite project
references, so `build` is the only way to typecheck the library.
