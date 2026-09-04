<script setup>
import { BVPlatformButton } from 'bojuvue'

const siteBase = import.meta.env.BASE_URL
</script>

<template>
  <BVPlatformButton
    :base="siteBase"
    manifest-url="platformButton.json"
    fallback-href="https://github.com/ScottKirvan/BojuVue/releases"
  />
</template>
