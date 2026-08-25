<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  detectPlatform,
  resolveDownload,
  resolveManifestUrl,
  type BVPlatformManifest,
  type BVPlatformId,
} from '../platform'

// The prop type is written out inline here (matching `BVPlatformButtonProps`
// in ../BVPlatformButton.types.ts, which is exported for public/programmatic
// use) rather than imported into this macro. `defineProps<T>()` resolving a
// type from another module needs @vue/compiler-sfc to load the `typescript`
// package to parse that module — this repo's docs/ site compiles files
// under repo-root src/ using docs/'s own Vue install, which doesn't carry
// `typescript` as its own dependency (see docs/.vitepress/config.mts's
// cross-directory resolution notes), so that lookup only succeeds when the
// repo root's node_modules happens to be present too. Keeping the type
// fully local avoids that dependency entirely.
const props = withDefaults(
  defineProps<{
    manifestUrl?: string
    fallbackHref?: string
    fallbackLabel?: string
    // Pass-through to the rendered button, left undefined so its own
    // defaults ('medium' / 'brand') apply when unset.
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
    // Pass-through to the rendered button, left undefined so its own
    // external-link auto-detection (target="_blank" + rel="noreferrer")
    // applies when unset.
    target?: string
    rel?: string
    // BVPlatformButton-only addition — raw SVG markup, rendered next to the
    // label via v-html. Caller-supplied only; never feed manifest-sourced
    // content here.
    icon?: string
    // Site base path to prefix a site-relative `manifestUrl` with. Plain
    // prop — this component has no knowledge of VitePress or any other
    // host framework; a host adapter (see `BVPlatformButton` exported from
    // the `./vitepress` entry) is responsible for resolving this (e.g. from
    // VitePress's own `useData().site.value.base`) and handing it down.
    base?: string
  }>(),
  {
    base: '',
    manifestUrl: 'platformButton.json',
  }
)

const manifest = ref<BVPlatformManifest | null>(null)
const platform = ref<BVPlatformId | null>(null)

let activeFetch: AbortController | null = null

async function loadManifest() {
  activeFetch?.abort()
  const controller = new AbortController()
  activeFetch = controller

  try {
    const res = await fetch(resolveManifestUrl(props.base, props.manifestUrl), {
      signal: controller.signal,
    })
    manifest.value = res.ok ? await res.json() : null
  } catch {
    // A request aborted because it was superseded by a newer one (base/
    // manifestUrl changed again, or the component unmounted) isn't a real
    // failure — don't let a stale in-flight abort clobber state a newer
    // request may already have written.
    if (controller.signal.aborted) return
    manifest.value = null
  }
}

onMounted(() => {
  platform.value = detectPlatform(typeof navigator === 'undefined' ? undefined : navigator)
  loadManifest()
})

// manifestUrl (and, in principle, base) can change after mount — e.g. a
// VitePress site's `base` can change on a locale switch — so re-fetch
// whenever either does, rather than only ever fetching once on mount.
watch(() => [props.base, props.manifestUrl], loadManifest)

onUnmounted(() => activeFetch?.abort())

const download = computed(() =>
  resolveDownload(platform.value, manifest.value, {
    fallbackHref: props.fallbackHref,
    fallbackLabel: props.fallbackLabel,
  })
)

// Reimplements VPButton's own external-link detection (`EXTERNAL_URL_RE` in
// vitepress's client/shared.js) so a resolved download href gets the same
// smart target/rel defaults a VitePress visitor would see from the real
// VPButton. Reimplemented rather than imported so this module stays free of
// any dependency on the `vitepress` package — see the class names below for
// the same reasoning applied to styling.
const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

const isExternal = computed(() => !!download.value && EXTERNAL_URL_RE.test(download.value.href))
const resolvedTarget = computed(() => props.target ?? (isExternal.value ? '_blank' : undefined))
const resolvedRel = computed(() => props.rel ?? (isExternal.value ? 'noreferrer' : undefined))
</script>

<template>
  <span v-if="download" class="bv-platform-button">
    <span v-if="icon" class="bv-platform-button-icon" v-html="icon"></span>
    <!--
      Own class name, not VPButton's — a core component with zero vitepress
      dependency shouldn't leak VitePress's private, internal class name
      into a consumer's rendered DOM (confusing outside a VitePress site,
      and not a stable contract to depend on). Instead it consumes the same
      *public, documented* --vp-button-* CSS custom properties VitePress
      itself exposes for theming (see vars.css) — real design tokens meant
      to be read by exactly this kind of external styling, not duplicated
      private CSS. Each property has a fallback value so the button still
      looks like a clickable button outside VitePress, where those
      variables are simply undefined, rather than rendering bare.
    -->
    <a
      class="bv-platform-button-link"
      :class="[size ?? 'medium', theme ?? 'brand']"
      :href="download.href"
      :target="resolvedTarget"
      :rel="resolvedRel"
      >{{ download.label }}</a
    >
  </span>
</template>

<style scoped>
.bv-platform-button {
  /* No margin/positioning of its own — spacing between this button and its
     neighbors (another instance, a hero actions row, etc.) is a caller/
     layout concern (flex + gap, or a wrapper at the call site), not
     something this component bakes into itself. See #32. */
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bv-platform-button-icon {
  display: inline-flex;
  align-items: center;
}

.bv-platform-button-icon :deep(svg) {
  width: 1em;
  height: 1em;
}

.bv-platform-button-link {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.bv-platform-button-link:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.bv-platform-button-link.medium {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.bv-platform-button-link.big {
  border-radius: 24px;
  padding: 0 24px;
  line-height: 46px;
  font-size: 16px;
}

.bv-platform-button-link.brand {
  border-color: var(--vp-button-brand-border, #3c8772);
  color: var(--vp-button-brand-text, #fff);
  background-color: var(--vp-button-brand-bg, #3c8772);
}
.bv-platform-button-link.brand:hover {
  border-color: var(--vp-button-brand-hover-border, #359469);
  color: var(--vp-button-brand-hover-text, #fff);
  background-color: var(--vp-button-brand-hover-bg, #359469);
}
.bv-platform-button-link.brand:active {
  border-color: var(--vp-button-brand-active-border, #2b8760);
  color: var(--vp-button-brand-active-text, #fff);
  background-color: var(--vp-button-brand-active-bg, #2b8760);
}

.bv-platform-button-link.alt {
  border-color: var(--vp-button-alt-border, transparent);
  color: var(--vp-button-alt-text, #3c3c43);
  background-color: var(--vp-button-alt-bg, #f2f2f3);
}
.bv-platform-button-link.alt:hover {
  border-color: var(--vp-button-alt-hover-border, transparent);
  color: var(--vp-button-alt-hover-text, #3c3c43);
  background-color: var(--vp-button-alt-hover-bg, #e6e6e7);
}
.bv-platform-button-link.alt:active {
  border-color: var(--vp-button-alt-active-border, transparent);
  color: var(--vp-button-alt-active-text, #3c3c43);
  background-color: var(--vp-button-alt-active-bg, #dcdcdd);
}

.bv-platform-button-link.sponsor {
  border-color: var(--vp-button-sponsor-border, transparent);
  color: var(--vp-button-sponsor-text, #d5389c);
  background-color: var(--vp-button-sponsor-bg, transparent);
}
.bv-platform-button-link.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border, #d5389c);
  color: var(--vp-button-sponsor-hover-text, #d5389c);
  background-color: var(--vp-button-sponsor-hover-bg, transparent);
}
.bv-platform-button-link.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border, #d5389c);
  color: var(--vp-button-sponsor-active-text, #d5389c);
  background-color: var(--vp-button-sponsor-active-bg, transparent);
}
</style>
