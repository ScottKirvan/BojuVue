<script setup lang="ts">
import { computed } from 'vue'
import { isExternalUrl } from './url'

// The prop type is written out inline here (matching `BVButtonProps` in
// ./BVButton.types.ts, which is exported for public/programmatic use)
// rather than imported into this macro — see the identical note in
// ./BVPlatformButton.vue for why.
const props = withDefaults(
  defineProps<{
    text: string
    href?: string
    target?: string
    rel?: string
    size?: 'medium' | 'big'
    theme?: 'brand' | 'alt' | 'sponsor'
    tag?: string
  }>(),
  {
    size: 'medium',
    theme: 'brand',
  }
)

// Matches VPButton's own tag auto-detection exactly
// (`props.tag || (props.href ? 'a' : 'button')`) — this component is meant
// to be a drop-in VPButton-equivalent outside VitePress, not a component
// with its own opinions about when it should be a link vs. a button.
const component = computed(() => props.tag || (props.href ? 'a' : 'button'))

const isExternal = computed(() => !!props.href && isExternalUrl(props.href))
const resolvedTarget = computed(() => props.target ?? (isExternal.value ? '_blank' : undefined))
const resolvedRel = computed(() => props.rel ?? (isExternal.value ? 'noreferrer' : undefined))
</script>

<template>
  <!--
    Own class name, not VPButton's — this generic Vue implementation has
    zero vitepress dependency and shouldn't leak VitePress's private,
    internal class name into a consumer's rendered DOM. Instead it consumes
    the same *public, documented* --vp-button-* CSS custom properties
    VitePress itself exposes for theming, each with a fallback value so the
    button still looks like a clickable button outside VitePress, where
    those variables are simply undefined.
  -->
  <component
    :is="component"
    class="bv-button"
    :class="[size, theme]"
    :href="href"
    :target="resolvedTarget"
    :rel="resolvedRel"
    >{{ text }}</component
  >
</template>

<style scoped>
.bv-button {
  display: inline-block;
  border: 1px solid transparent;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}

.bv-button:active {
  transition: color 0.1s, border-color 0.1s, background-color 0.1s;
}

.bv-button.medium {
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  font-size: 14px;
}

.bv-button.big {
  border-radius: 24px;
  padding: 0 24px;
  line-height: 46px;
  font-size: 16px;
}

.bv-button.brand {
  border-color: var(--vp-button-brand-border, #3c8772);
  color: var(--vp-button-brand-text, #fff);
  background-color: var(--vp-button-brand-bg, #3c8772);
}
.bv-button.brand:hover {
  border-color: var(--vp-button-brand-hover-border, #359469);
  color: var(--vp-button-brand-hover-text, #fff);
  background-color: var(--vp-button-brand-hover-bg, #359469);
}
.bv-button.brand:active {
  border-color: var(--vp-button-brand-active-border, #2b8760);
  color: var(--vp-button-brand-active-text, #fff);
  background-color: var(--vp-button-brand-active-bg, #2b8760);
}

.bv-button.alt {
  border-color: var(--vp-button-alt-border, transparent);
  color: var(--vp-button-alt-text, #3c3c43);
  background-color: var(--vp-button-alt-bg, #f2f2f3);
}
.bv-button.alt:hover {
  border-color: var(--vp-button-alt-hover-border, transparent);
  color: var(--vp-button-alt-hover-text, #3c3c43);
  background-color: var(--vp-button-alt-hover-bg, #e6e6e7);
}
.bv-button.alt:active {
  border-color: var(--vp-button-alt-active-border, transparent);
  color: var(--vp-button-alt-active-text, #3c3c43);
  background-color: var(--vp-button-alt-active-bg, #dcdcdd);
}

.bv-button.sponsor {
  border-color: var(--vp-button-sponsor-border, transparent);
  color: var(--vp-button-sponsor-text, #d5389c);
  background-color: var(--vp-button-sponsor-bg, transparent);
}
.bv-button.sponsor:hover {
  border-color: var(--vp-button-sponsor-hover-border, #d5389c);
  color: var(--vp-button-sponsor-hover-text, #d5389c);
  background-color: var(--vp-button-sponsor-hover-bg, transparent);
}
.bv-button.sponsor:active {
  border-color: var(--vp-button-sponsor-active-border, #d5389c);
  color: var(--vp-button-sponsor-active-text, #d5389c);
  background-color: var(--vp-button-sponsor-active-bg, transparent);
}
</style>
