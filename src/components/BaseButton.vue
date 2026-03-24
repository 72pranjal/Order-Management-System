<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <button :type="props.type" :class="props.variant === 'primary' ? 'theme-toggle' : 'chip-button'">
    <slot />
  </button>
</template>
