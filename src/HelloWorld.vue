<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    text?: string
  }>(),
  {
    title: 'Test Title',
    text: 'Hello from BojuVue',
  }
)
</script>

<template>
  <section class="bv-hello-world">
    <h2 class="bv-hello-world-title">{{ title }}</h2>
    <div class="bv-hello-world-box">
      <svg
        class="bv-hello-world-icon"
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364-2.121 2.121M8.757 15.243l-2.121 2.121m0-10.728 2.121 2.121m7.486 7.486 2.121 2.121" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <p class="bv-hello-world-text">{{ text }}</p>
    </div>
  </section>
</template>

<style scoped>
.bv-hello-world {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem auto;
}

.bv-hello-world-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.bv-hello-world-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 240px;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-align: center;
}

.bv-hello-world-icon {
  color: var(--vp-c-brand-1);
}

.bv-hello-world-text {
  margin: 0;
  color: var(--vp-c-text-1);
}
</style>
