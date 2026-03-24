<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-pop">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-card glass-panel">
          <div class="modal-head">
            <div>
              <p class="eyebrow">Quick action</p>
              <h3>{{ title }}</h3>
            </div>
            <button class="chip-button" @click="emit('close')">Close</button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
