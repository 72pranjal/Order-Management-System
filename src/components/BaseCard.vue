<script setup>
defineProps({
  as: {
    type: String,
    default: 'article',
  },
})
</script>

<template>
  <component :is="as" class="glass-panel">
    <slot />
  </component>
</template>
