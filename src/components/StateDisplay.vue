<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'empty',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="state-card" :class="{ 'state-loading': mode === 'loading' }">
    <template v-if="mode === 'loading'">
      <div class="state-loading-hero">
        <div class="state-illustration loading">
          <span></span>
          <span></span>
          <span></span>
          <div class="state-loader-core"></div>
        </div>

        <div class="state-loading-copy">
          <p class="eyebrow">{{ eyebrow || 'Loading workspace' }}</p>
          <h3>{{ title || 'Preparing your order workspace' }}</h3>
          <p class="muted">{{ message || 'Fetching the latest order data, metrics, and workflow details.' }}</p>
        </div>
      </div>

      <div class="state-loading-grid">
        <div class="skeleton skeleton-stat"></div>
        <div class="skeleton skeleton-stat"></div>
        <div class="skeleton skeleton-stat"></div>
        <div class="skeleton tall"></div>
        <div class="skeleton tall"></div>
        <div class="skeleton wide"></div>
      </div>
    </template>

    <template v-else>
      <div class="state-illustration" :class="mode">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h3>{{ title }}</h3>
      <p class="muted">{{ message }}</p>
      <slot />
    </template>
  </section>
</template>
