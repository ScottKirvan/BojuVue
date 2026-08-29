<script setup>
import { BVMoreButton } from '@scottkirvan/bojuvue/vitepress'

const GITHUB_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.293 0 .32.216.694.824.576C20.565 23.092 24 18.596 24 13.297c0-6.627-5.373-12-12-12z"/></svg>'
const BUG_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5 7 3M15 5l2-2"/><circle cx="12" cy="6" r="2"/><rect x="7" y="8" width="10" height="11" rx="5"/><path d="M7 11H3M21 11h-4M7 14H3M21 14h-4M7 17l-3 3M17 17l3 3"/></svg>'
</script>

<template>
  <BVMoreButton
    :items="[
      { label: 'GitHub repo', href: 'https://github.com/ScottKirvan/BojuVue', icon: GITHUB_ICON },
      { label: 'Report a bug', href: 'https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md', icon: BUG_ICON },
    ]"
  />
</template>
