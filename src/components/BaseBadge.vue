<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'subtle',
  },
})

const badgeClass = computed(() => props.variant.toLowerCase().replace(/\s+/g, '-'))
</script>

<template>
  <span class="badge" :class="badgeClass">
    <slot />
  </span>
</template>
